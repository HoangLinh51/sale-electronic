import { AppDataSource } from '../conectdb';
import { Categories } from '../entity/categories';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { GetUserIdLogin } from '../middlewares/checkJwt';

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Categories);
    const { categoryName } = req.body;
    const newCategory = new Categories();

    const userId = GetUserIdLogin();
    if (!userId) {
      res.status(401).send('Token invalid');
    }

    newCategory.categoryName = categoryName;
    newCategory.createdAt = new Date();
    newCategory.createdBy = userId;

    const category = await repository.createQueryBuilder('c').where('c.categoryName = :categoryName', { categoryName }).getOne();
    if (category) {
      res.status(400).send({ message: 'Category is already taken' });
    } else {
      const response = await repository.save(newCategory);
      res.status(200).send(response);
    }
  }

  async getCategoryById(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Categories);
    const { id } = req.params;
    const response = await repository.createQueryBuilder().where('id = :id', { id }).andWhere('isDeleted = FALSE').getOne();
    res.status(200).send(response);
  }

  async search(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Categories);
    const categoryName = req.query.name;

    const page: string = (req.query.page as string) || '1';
    const p = parseInt(page);
    const take: string = (req.query.take as string) || '2';
    const t = parseInt(take);
    let skip = (p - 1) * t;
    if (skip < 0) {
      skip = 0;
    }

    const query = repository.createQueryBuilder('q').where('q.isDeleted = FALSE');
    if (categoryName) {
      query.andWhere('q.categoryName LIKE :categoryName', { categoryName });
    }
    const response = await query.take(t).skip(skip).getMany();
    res.status(200).send(response);
  }

  async updateCategory(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Categories);
    const { id } = req.params;
    const { categoryName } = req.body;

    const newCategory = new Categories();

    const userId = GetUserIdLogin();
    if (!userId) {
      res.status(401).send('Token invalid');
    }
    newCategory.updatedAt = new Date();
    newCategory.updatedBy = userId;

    const response = await repository
      .createQueryBuilder()
      .update(Categories)
      .set({ categoryName: categoryName, updatedAt: new Date(), updatedBy: userId })
      .where('id = :id', { id })
      .execute();
    res.status(200).send({ message: 'Category Name has been updated' });
  }

  async delete(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Categories);
    const { id } = req.params;
    const response = repository.createQueryBuilder().update(Categories).set({ isDeleted: true }).where('id = :id', { id }).execute();
    res.status(200).send(response);
  }
}
