import logger from '../config/logger.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      logger.error(`Error creating in repository for model ${this.model.modelName}: %s`, error.message);
      throw error;
    }
  }

  async findById(id, populate = '', select = '') {
    try {
      let query = this.model.findById(id);
      if (populate) query = query.populate(populate);
      if (select) query = query.select(select);
      return await query.exec();
    } catch (error) {
      logger.error(`Error finding by ID in repository for model ${this.model.modelName}: %s`, error.message);
      throw error;
    }
  }

  async findOne(filter = {}, populate = '', select = '') {
    try {
      let query = this.model.findOne(filter);
      if (populate) query = query.populate(populate);
      if (select) query = query.select(select);
      return await query.exec();
    } catch (error) {
      logger.error(`Error finding one in repository for model ${this.model.modelName}: %s`, error.message);
      throw error;
    }
  }

  async find(filter = {}, populate = '', select = '', sort = '-createdAt') {
    try {
      let query = this.model.find(filter);
      if (populate) query = query.populate(populate);
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);
      return await query.exec();
    } catch (error) {
      logger.error(`Error finding in repository for model ${this.model.modelName}: %s`, error.message);
      throw error;
    }
  }

  async update(id, data, options = { new: true, runValidators: true }) {
    try {
      return await this.model.findByIdAndUpdate(id, data, options).exec();
    } catch (error) {
      logger.error(`Error updating in repository for model ${this.model.modelName}: %s`, error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      logger.error(`Error deleting in repository for model ${this.model.modelName}: %s`, error.message);
      throw error;
    }
  }

  /**
   * Universal method for filtering, search, sorting, and pagination
   */
  async findWithPaginationAndFilter({
    filter = {},
    page = 1,
    limit = 10,
    sort = '-createdAt',
    searchFields = [], // fields to run regex search on
    searchQuery = '',
    populate = '',
    select = ''
  }) {
    try {
      const queryFilter = { ...filter };

      // Apply search query if provided
      if (searchQuery && searchFields.length > 0) {
        queryFilter.$or = searchFields.map((field) => ({
          [field]: { $regex: searchQuery, $options: 'i' }
        }));
      }

      const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
      const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
      const skip = (parsedPage - 1) * parsedLimit;

      let query = this.model.find(queryFilter);

      if (populate) query = query.populate(populate);
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);

      query = query.skip(skip).limit(parsedLimit);

      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(queryFilter)
      ]);

      return {
        data,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / parsedLimit),
          currentPage: parsedPage,
          limit: parsedLimit
        }
      };
    } catch (error) {
      logger.error(`Error query with pagination in repository for model ${this.model.modelName}: %s`, error.message);
      throw error;
    }
  }
}
