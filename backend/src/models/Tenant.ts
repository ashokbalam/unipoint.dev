import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// Use forwardRef to avoid circular import issues
import { Category } from './Category';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Category, (category) => category.tenant)
  categories!: Category[];
} 