import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Tenant } from './models/Tenant';
import { Category } from './models/Category';
import { Question } from './models/Question';
import tenantRoutes from './routes/tenantRoutes';
import categoryRoutes from './routes/categoryRoutes';
import questionRoutes from './routes/questionRoutes';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(tenantRoutes);
app.use(categoryRoutes);
app.use(questionRoutes);

// TypeORM DataSource setup
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true, // Set to false in production
  logging: false,
  entities: [Tenant, Category, Question],
  migrations: [],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

// Health check route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 