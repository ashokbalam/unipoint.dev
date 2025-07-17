import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './Category';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  text!: string;

  @Column('jsonb')
  options!: { label: string; points: number }[];

  @ManyToOne(() => Category, (category) => category.questions)
  category!: Category;
} 