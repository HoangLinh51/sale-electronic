import { AppDataSource } from '../conectdb';
import { Brands } from '../entity/brands';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { GetUserIdLogin } from '../middlewares/checkJwt';

export class BrandController {
  async createBrand(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Brands);
    const { brandName, description } = req.body;
    const newBrand = new Brands();

    const userId = GetUserIdLogin();
    if (!userId) {
      res.status(401).send('Token invalid');
    }

    newBrand.brandName = brandName;
    newBrand.description = description;
    newBrand.createdAt = new Date();
    newBrand.createdBy = userId;

    const brand = await repository.createQueryBuilder('b').where('b.brandName = :brandName', { brandName }).getOne();
    if (brand) {
      res.status(400).send({ message: 'Brand is already taken' });
    } else {
      const response = await repository.save(newBrand);
      res.status(200).send(response);
    }
  }

  async getBrandById(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Brands);
    const { id } = req.params;
    const response = await repository.createQueryBuilder().where('id = :id', { id }).andWhere('isDeleted = FALSE').getOne();
    res.status(200).send(response);
  }

  async list(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Brands);
    const response = await repository.createQueryBuilder().where('isDeleted = FALSE').getManyAndCount();
    res.status(200).send(response);
  }

  async updateBrand(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Brands);
    const { id } = req.params;
    const { brandName, brandInformation } = req.body;

    const newBrand = new Brands();

    const userId = GetUserIdLogin();
    if (!userId) {
      res.status(401).send('Token invalid');
    }
    newBrand.updatedAt = new Date();
    newBrand.updatedBy = userId;

    const response = await repository
      .createQueryBuilder()
      .update(Brands)
      .set({ brandName: brandName, description: brandInformation, updatedAt: new Date(), updatedBy: userId })
      .where('id = :id', { id })
      .execute();
    res.status(200).send({ message: 'Information has been updated' });
  }

  async delete(req: Request, res: Response) {
    const repository = AppDataSource.getRepository(Brands);
    const { id } = req.params;
    const response = await repository.createQueryBuilder().update(Brands).set({ isDeleted: true }).where('id = :id', { id }).execute();
    res.status(200).send(response);
  }
}
