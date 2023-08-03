import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class ProductSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<any> {
    // const repository = dataSource.getRepository(Product);
    // await repository.insert([]);
  }
}
