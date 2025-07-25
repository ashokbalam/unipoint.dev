import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Tenant } from './models/Tenant';
import { Category } from './models/Category';
import { Question } from './models/Question';
import { TenantController } from './controllers/TenantController';
import { CategoryController } from './controllers/CategoryController';
import { QuestionController } from './controllers/QuestionController';
import multer from 'multer';
import { BulkUploadController } from './controllers/BulkUploadController';

// Load environment variables
dotenv.config();

// TypeORM DataSource setup
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: false,
  entities: [__dirname + '/models/*.{js,ts}'],
  migrations: [],
  subscribers: [],
});

const seedDatabase = async () => {
  const tenantRepo = AppDataSource.getRepository(Tenant);
  const count = await tenantRepo.count();

  if (count === 0) {
    console.log('No tenants found. Seeding database...');
    const defaultTeams = [
      { name: 'Falcons' },
      { name: 'Eagles' },
      { name: 'Sharks' },
      { name: 'Bears' },
      { name: 'Tigers' },
      { name: 'Panthers' },
    ];
    await tenantRepo.save(tenantRepo.create(defaultTeams));
    console.log('Default teams have been seeded.');
  } else {
    console.log('Database already has tenants. Skipping seed.');
  }
};

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    await seedDatabase();

    const app = express();
    app.use(cors());
    app.use(express.json());

    /**
     * Multer configuration
     *  - Limit file size to 10 MB
     *  - Accept only .csv or .json uploads
     */
    const upload = multer({
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const isCsv = file.mimetype === 'text/csv' || file.originalname.match(/\.csv$/i);
        const isJson =
          file.mimetype === 'application/json' || file.originalname.match(/\.json$/i);
        if (isCsv || isJson) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV and JSON files are allowed.'));
        }
      },
    });
    
    // Tenant Routes
    app.post('/tenants', TenantController.createTenant);
    app.get('/tenants', TenantController.getTenants);
    app.get('/tenants/:id', TenantController.getTenantById);

    // Category Routes
    app.post('/categories', CategoryController.createCategory);
    app.get('/categories', CategoryController.getCategories);
    app.get('/categories/:id', CategoryController.getCategoryById);
    app.put('/categories/:id', CategoryController.updateCategory);

    // Question Routes
    app.post('/questions', QuestionController.createQuestion);
    app.get('/questions', QuestionController.getQuestions);

    // Bulk Upload Routes
    app.get('/bulk-upload/template', BulkUploadController.getTemplate);
    app.post(
      '/tenants/:tenantId/bulk-upload',
      upload.array('files'),
      BulkUploadController.bulkUpload
    );

    // Health check route
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  }); 