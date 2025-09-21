const { List, ListEntry, Admin } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const rssService = require('../services/rssService');
const mammoth = require('mammoth');

class ListController {
  constructor() {
    console.log('=== ListController constructor called ===');

    // Bind methods to preserve context
    this.getAllLists = this.getAllLists.bind(this);
    this.getList = this.getList.bind(this);
    this.createList = this.createList.bind(this);
    this.updateList = this.updateList.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.getListEntry = this.getListEntry.bind(this);
    this.getListEntries = this.getListEntries.bind(this);
    this.createListEntry = this.createListEntry.bind(this);
    this.updateListEntry = this.updateListEntry.bind(this);
    this.deleteListEntry = this.deleteListEntry.bind(this);
    this.parseDocxFile = this.parseDocxFile.bind(this);
    this.generateStructuredData = this.generateStructuredData.bind(this);
    this.checkEditPermission = this.checkEditPermission.bind(this);
    this.checkDeletePermission = this.checkDeletePermission.bind(this);
  }

  // Get all lists with filters and pagination
  async getAllLists(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        year,
        recommended,
        category,
        search,
        sort_by = 'createdAt',
        sort_order = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (status && status !== 'all') whereClause.status = status;
      if (year && year !== 'all') whereClause.year = year;
      if (recommended !== undefined) whereClause.recommended = recommended === 'true';
      if (category && category !== 'all') whereClause.category = category;

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: lists } = await List.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'description', 'content', 'featuredImage',
          'imageCaption', 'imageAlt', 'metaTitle', 'metaDescription', 'category',
          'year', 'recommended', 'richLists', 'entrepreneurs', 'companies',
          'leaders', 'entertainment', 'sports', 'lifestyle', 'methodology',
          'status', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ],
        include: [
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: ListEntry,
            as: 'entries',
            where: { status: 'active' },
            required: false,
            attributes: ['id']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true
      });

      res.json({
        success: true,
        data: {
          lists,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get lists error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lists',
        error: error.message
      });
    }
  }

  // Get single list by ID or slug
  async getList(req, res) {
    try {
      const { id } = req.params;
      // Check if id is a UUID (36 characters with dashes)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const whereClause = uuidRegex.test(id) ? { id: id } : { slug: id };

      const list = await List.findOne({
        where: whereClause,
        attributes: [
          'id', 'title', 'slug', 'description', 'content', 'featuredImage',
          'imageCaption', 'imageAlt', 'metaTitle', 'metaDescription', 'category',
          'year', 'recommended', 'richLists', 'entrepreneurs', 'companies',
          'leaders', 'entertainment', 'sports', 'lifestyle', 'methodology',
          'status', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'
        ],
        include: [
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'name', 'email']
          },
          {
            model: ListEntry,
            as: 'entries',
            where: { status: 'active' },
            required: false,
            attributes: [
              'id', 'name', 'slug', 'rank', 'designation', 'company', 'residence',
              'description', 'nationality', 'category', 'image', 'imageCaption',
              'imageAlt', 'metaTitle', 'metaDescription', 'status', 'createdAt'
            ],
            order: [['rank', 'ASC']]
          }
        ]
      });

      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'List not found'
        });
      }

      // Add JSON-LD structured data for published lists
      if (list.status === 'published') {
        try {
          list.dataValues.structuredData = this.generateStructuredData(list);
        } catch (error) {
          console.error('Error generating structured data:', error);
        }
      }

      res.json({
        success: true,
        data: list
      });
    } catch (error) {
      console.error('Get list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch list',
        error: error.message
      });
    }
  }

  // Create new list
  async createList(req, res) {
    try {
      console.log('=== Create List Debug ===');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('req.body:', req.body);
      console.log('req.files:', req.files);
      console.log('req.body keys:', Object.keys(req.body));
      
      // Log each field individually
      Object.keys(req.body).forEach(key => {
        console.log(`Field ${key}:`, req.body[key]);
      });

      // Extract fields - handle both direct access and array values from FormData
      const extractField = (field) => {
        if (Array.isArray(req.body[field])) {
          return req.body[field][0];
        }
        return req.body[field];
      };

      const title = extractField('title');
      const slug = extractField('slug');
      const description = extractField('description');
      const content = extractField('content');
      const category = extractField('category');
      const year = extractField('year');
      const recommended = extractField('recommended');
      const richLists = extractField('richLists');
      const entrepreneurs = extractField('entrepreneurs');
      const companies = extractField('companies');
      const leaders = extractField('leaders');
      const entertainment = extractField('entertainment');
      const sports = extractField('sports');
      const lifestyle = extractField('lifestyle');
      const methodology = extractField('methodology');
      const meta_title = extractField('meta_title');
      const meta_description = extractField('meta_description');
      const featured_image_caption = extractField('featured_image_caption');

      console.log('Extracted title:', title);
      console.log('Extracted slug:', slug);
      
      const userId = req.admin?.id;

      // Validate required fields
      if (!title || title.trim() === '') {
        console.log('Title validation failed:', title);
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      // Handle featured image upload
      let featuredImagePath = null;
      if (req.files) {
        const featuredImageFile = req.files.find(file => file.fieldname === 'featured_image');
        if (featuredImageFile) {
          console.log('Processing featured image:', featuredImageFile.filename);

          try {
            const { ImageUploadService } = require('../services/imageUploadService');
            const imageService = new ImageUploadService();
            const processedFilename = await imageService.processImage(featuredImageFile.path, {
              width: 1200,
              height: 800,
              quality: 85,
              format: 'webp'
            });
            featuredImagePath = `/storage/images/${processedFilename}`;
            console.log('✅ Featured image processed:', processedFilename);
            console.log('📄 Featured image path for DB:', featuredImagePath);
          } catch (imageError) {
            console.error('❌ Image processing error:', imageError);
            // Fallback to original file
            featuredImagePath = `/storage/images/${featuredImageFile.filename}`;
            console.log('🔄 Using fallback image path:', featuredImagePath);
          }
        }
      }

      // Create list
      const listData = {
        title: title.trim(),
        slug: slug?.trim(),
        description: description?.trim(),
        content: content?.trim(),
        category: category?.trim(),
        year: year ? parseInt(year) : null,
        recommended: recommended === 'true',
        richLists: richLists === 'true',
        entrepreneurs: entrepreneurs === 'true',
        companies: companies === 'true',
        leaders: leaders === 'true',
        entertainment: entertainment === 'true',
        sports: sports === 'true',
        lifestyle: lifestyle === 'true',
        methodology: methodology?.trim(),
        metaTitle: meta_title?.trim(),
        metaDescription: meta_description?.trim(),
        featuredImage: featuredImagePath,
        imageCaption: featured_image_caption?.trim(),
        status: 'draft',
        createdBy: userId
      };

      console.log('Creating list with data:', listData);

      const list = await List.create(listData);

      // Parse DOCX file and create entries if provided
      console.log('=== DOCX Processing Section ===');
      console.log('req.files exists:', !!req.files);
      let docxFile = null;

      if (req.files) {
        console.log('req.files length:', req.files.length);
        console.log('req.files details:', req.files.map(f => ({ fieldname: f.fieldname, originalname: f.originalname })));
        docxFile = req.files.find(file => file.fieldname === 'docx_file');
        console.log('docxFile found:', !!docxFile);
      }

      // Validate that DOCX file is provided
      if (!docxFile) {
        console.log('DOCX file validation failed: no file provided');
        return res.status(400).json({
          success: false,
          message: 'DOCX file is required for creating list entries'
        });
      }

      try {
        console.log('Parsing DOCX file for entries:', docxFile.filename);

        // Parse DOCX file
        let text = '';
        try {
          const result = await mammoth.extractRawText({ path: docxFile.path });
          text = result.value;
          console.log('Successfully extracted text from DOCX');
        } catch (docxError) {
          console.error('DOCX parsing failed:', docxError.message);

          // Try to read as plain text file as fallback
          try {
            const fs = require('fs').promises;
            text = await fs.readFile(docxFile.path, 'utf8');
            console.log('Fallback: Read file as plain text');
          } catch (textError) {
            console.error('Fallback text reading also failed:', textError.message);
            throw new Error('Unable to read DOCX file. The file may be corrupted or in an unsupported format.');
          }
        }

        console.log('=== DOCX Parsing Debug ===');
        console.log('Raw text from DOCX:', text);
        console.log('Text lines:', text.split('\n'));

        // Parse the text to extract entries
        const entries = this.parseDocxContent(text);
        console.log('Parsed entries:', entries);

        // Validate that entries were found
        if (entries.length === 0) {
          console.log('No entries found in DOCX file');
          return res.status(400).json({
            success: false,
            message: 'No valid entries found in the DOCX file. Please ensure the file contains properly formatted list entries.'
          });
        }

        // Create list entries
        const createdEntries = [];
        for (const entryData of entries) {
          try {
            console.log('Creating entry with data:', {
              ...entryData,
              listId: list.id,
              createdBy: userId
            });

            // Ensure required fields are present
            if (!entryData.name || entryData.name.trim() === '') {
              console.log('Skipping entry with missing name:', entryData);
              continue;
            }

            const entry = await ListEntry.create({
              ...entryData,
              listId: list.id,
              createdBy: userId,
              status: 'active',
              slug: 'temp-slug-' + Date.now() // Temporary slug to pass validation
            });
            console.log('Successfully created entry:', entry.id);
            createdEntries.push(entry);
          } catch (error) {
            console.error('Error creating entry:', entryData, error);
            console.error('Entry creation error details:', error.message);
          }
        }

        console.log(`Created ${createdEntries.length} entries from DOCX`);

        if (createdEntries.length === 0) {
          console.log('Failed to create any entries from DOCX');
          return res.status(400).json({
            success: false,
            message: 'Failed to create any entries from the DOCX file. Please check the file format and content.'
          });
        }

        // Delete the uploaded DOCX file
        try {
          await fs.unlink(docxFile.path);
          console.log('DOCX file deleted successfully');
        } catch (err) {
          console.warn('Could not delete DOCX file:', err.message);
        }
      } catch (docxError) {
        console.error('Error parsing DOCX file:', docxError);
        return res.status(400).json({
          success: false,
          message: `Failed to parse DOCX file: ${docxError.message}`
        });
      }

      // Update RSS feed if list is published
      if (list.status === 'published') {
        await rssService.updateRSSFeed();
      }

      // Get complete list with associations
      const completeList = await List.findByPk(list.id, {
        include: [
          { model: Admin, as: 'creator' },
          {
            model: ListEntry,
            as: 'entries',
            where: { status: 'active' },
            required: false,
            attributes: [
              'id', 'name', 'slug', 'rank', 'designation', 'company', 'residence',
              'description', 'nationality', 'category', 'image', 'imageCaption',
              'imageAlt', 'metaTitle', 'metaDescription', 'status', 'createdAt'
            ],
            order: [['rank', 'ASC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'List created successfully',
        data: completeList
      });
    } catch (error) {
      console.error('Create list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create list',
        error: error.message
      });
    }
  }

  // Update list
  async updateList(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const list = await List.findByPk(id);
      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'List not found'
        });
      }

      // Check permissions
      const canEdit = this.checkEditPermission(list, userId, req.admin);
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit this list'
        });
      }

      // Handle featured image upload
      let featuredImagePath = list.featuredImage;
      if (req.files) {
        const featuredImageFile = req.files.find(file => file.fieldname === 'featured_image');
        if (featuredImageFile) {

          try {
            const { ImageUploadService } = require('../services/imageUploadService');
            const imageService = new ImageUploadService();
            const processedFilename = await imageService.processImage(featuredImageFile.path, {
              width: 1200,
              height: 800,
              quality: 85,
              format: 'webp'
            });
            featuredImagePath = `/storage/images/${processedFilename}`;

            // Delete old image if exists
            if (list.featuredImage) {
              try {
                await fs.unlink(path.join(__dirname, '..', list.featuredImage));
              } catch (err) {
                console.warn('Could not delete old image:', err.message);
              }
            }
          } catch (imageError) {
            console.error('Image processing error:', imageError);
            featuredImagePath = `/storage/images/${featuredImageFile.filename}`;
          }
        }
      }

      // Parse boolean fields
      const updateData = {
        ...req.body,
        updatedBy: userId,
        featuredImage: featuredImagePath,
        recommended: req.body.recommended === 'true',
        richLists: req.body.richLists === 'true',
        entrepreneurs: req.body.entrepreneurs === 'true',
        companies: req.body.companies === 'true',
        leaders: req.body.leaders === 'true',
        entertainment: req.body.entertainment === 'true',
        sports: req.body.sports === 'true',
        lifestyle: req.body.lifestyle === 'true'
      };

      // Clean up empty strings
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      });

      // Update list
      await list.update(updateData);

      // Update RSS feed if list status changed to published or was already published
      if (req.body.status === 'published' || list.status === 'published') {
        await rssService.updateRSSFeed();
      }

      const updatedList = await List.findByPk(id, {
        include: [
          { model: Admin, as: 'creator' }
        ]
      });

      res.json({
        success: true,
        message: 'List updated successfully',
        data: updatedList
      });
    } catch (error) {
      console.error('Update list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update list',
        error: error.message
      });
    }
  }

  // Delete list
  async deleteList(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const list = await List.findByPk(id);
      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'List not found'
        });
      }

      // Check permissions
      const canDelete = this.checkDeletePermission(list, userId, req.admin);
      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this list'
        });
      }

      // Delete associated files
      if (list.featuredImage) {
        try {
          await fs.unlink(path.join(__dirname, '..', list.featuredImage));
        } catch (err) {
          console.warn('Could not delete featured image:', err.message);
        }
      }

      // Update RSS feed if the deleted list was published
      if (list.status === 'published') {
        await rssService.updateRSSFeed();
      }

      await list.destroy();

      res.json({
        success: true,
        message: 'List deleted successfully'
      });
    } catch (error) {
      console.error('Delete list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete list',
        error: error.message
      });
    }
  }

  // Get single list entry by ID
  async getListEntry(req, res) {
    try {
      const { id } = req.params;

      const entry = await ListEntry.findByPk(id, {
        attributes: [
          'id', 'listId', 'name', 'slug', 'rank', 'designation', 'company', 'residence',
          'description', 'nationality', 'category', 'image', 'imageCaption',
          'imageAlt', 'metaTitle', 'metaDescription', 'status', 'createdAt'
        ],
        include: [
          {
            model: List,
            as: 'list',
            attributes: ['id', 'title', 'slug']
          }
        ]
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'List entry not found'
        });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Get list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch list entry',
        error: error.message
      });
    }
  }

  // Get list entries for a specific list
  async getListEntries(req, res) {
    try {
      const { listId } = req.params;
      const {
        page = 1,
        limit = 20,
        status = 'active',
        search,
        sort_by = 'rank',
        sort_order = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { listId };

      // Apply filters
      if (status && status !== 'all') whereClause.status = status;

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { designation: { [Op.iLike]: `%${search}%` } },
          { company: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: entries } = await ListEntry.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'name', 'slug', 'rank', 'designation', 'company', 'residence',
          'description', 'nationality', 'category', 'image', 'imageCaption',
          'imageAlt', 'metaTitle', 'metaDescription', 'status', 'createdAt'
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true
      });

      res.json({
        success: true,
        data: {
          entries,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get list entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch list entries',
        error: error.message
      });
    }
  }

  // Create list entry
  async createListEntry(req, res) {
    try {
      const { listId } = req.params;
      const {
        name,
        slug,
        rank,
        designation,
        company,
        residence,
        description,
        nationality,
        category,
        meta_title,
        meta_description,
        image_caption
      } = req.body;

      const userId = req.admin?.id;

      // Validate required fields
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
        });
      }

      console.log('=== Create List Entry Debug ===');
      console.log('Extracted name:', name);
      console.log('Extracted slug:', slug);

      // Check if list exists
      const list = await List.findByPk(listId);
      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'List not found'
        });
      }

      // Handle image upload
      let imagePath = null;
      if (req.files) {
        const imageFile = req.files.find(file => file.fieldname === 'image');
        if (imageFile) {
          const { ImageUploadService } = require('../services/imageUploadService');
          const imageService = new ImageUploadService();
          const processedFilename = await imageService.processImage(imageFile.path, {
            width: 400,
            height: 400,
            quality: 85,
            format: 'webp'
          });
          imagePath = `/storage/images/${processedFilename}`;
        }
      }

      // Create list entry
      const entryData = {
        listId,
        name,
        slug: slug?.trim(),
        rank: rank ? parseInt(rank) : null,
        designation,
        company,
        residence,
        description,
        nationality,
        category,
        image: imagePath,
        imageCaption: image_caption,
        metaTitle: meta_title,
        metaDescription: meta_description,
        status: 'active',
        createdBy: userId
      };

      const entry = await ListEntry.create(entryData);

      // Update RSS feed if list is published
      if (list.status === 'published') {
        await rssService.updateRSSFeed();
      }

      res.status(201).json({
        success: true,
        message: 'List entry created successfully',
        data: entry
      });
    } catch (error) {
      console.error('Create list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create list entry',
        error: error.message
      });
    }
  }

  // Update list entry
  async updateListEntry(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const entry = await ListEntry.findByPk(id);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'List entry not found'
        });
      }

      // Handle image upload
      let imagePath = entry.image;
      if (req.files) {
        const imageFile = req.files.find(file => file.fieldname === 'image');
        if (imageFile) {
          const { ImageUploadService } = require('../services/imageUploadService');
          const imageService = new ImageUploadService();
          const processedFilename = await imageService.processImage(imageFile.path, {
            width: 400,
            height: 400,
            quality: 85,
            format: 'webp'
          });
          imagePath = `/storage/images/${processedFilename}`;

          // Delete old image if exists
          if (entry.image) {
            try {
              await fs.unlink(path.join(__dirname, '..', entry.image));
            } catch (err) {
              console.warn('Could not delete old image:', err.message);
            }
          }
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: userId,
        image: imagePath
      };

      // Handle empty strings for optional text fields
      if (updateData.imageCaption === '') {
        updateData.imageCaption = null;
      }

      // Check if the list is published to update RSS feed
      const list = await List.findByPk(entry.listId);
      const wasPublished = list && list.status === 'published';

      await entry.update(updateData);

      // Update RSS feed if list is published
      if (wasPublished) {
        await rssService.updateRSSFeed();
      }

      res.json({
        success: true,
        message: 'List entry updated successfully',
        data: entry
      });
    } catch (error) {
      console.error('Update list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update list entry',
        error: error.message
      });
    }
  }

  // Delete list entry
  async deleteListEntry(req, res) {
    try {
      const { id } = req.params;

      const entry = await ListEntry.findByPk(id);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'List entry not found'
        });
      }

      // Check if the list is published to update RSS feed
      const list = await List.findByPk(entry.listId);
      const wasPublished = list && list.status === 'published';

      // Delete associated image
      if (entry.image) {
        try {
          await fs.unlink(path.join(__dirname, '..', entry.image));
        } catch (err) {
          console.warn('Could not delete image:', err.message);
        }
      }

      await entry.destroy();

      // Update RSS feed if list is published
      if (wasPublished) {
        await rssService.updateRSSFeed();
      }

      res.json({
        success: true,
        message: 'List entry deleted successfully'
      });
    } catch (error) {
      console.error('Delete list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete list entry',
        error: error.message
      });
    }
  }

  // Parse DOCX file and create list entries
  async parseDocxFile(req, res) {
    try {
      const { listId } = req.params;

      if (!req.files) {
        return res.status(400).json({
          success: false,
          message: 'DOCX file is required'
        });
      }

      const docxFile = req.files.find(file => file.fieldname === 'docx_file');
      if (!docxFile) {
        return res.status(400).json({
          success: false,
          message: 'DOCX file is required'
        });
      }

      // Check if list exists
      const list = await List.findByPk(listId);
      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'List not found'
        });
      }

      // Parse DOCX file
      let text = '';
      try {
        const result = await mammoth.extractRawText({ path: docxFile.path });
        text = result.value;
        console.log('Successfully extracted text from DOCX');
      } catch (docxError) {
        console.error('DOCX parsing failed:', docxError.message);

        // Try to read as plain text file as fallback
        try {
          const fs = require('fs').promises;
          text = await fs.readFile(docxFile.path, 'utf8');
          console.log('Fallback: Read file as plain text');
        } catch (textError) {
          console.error('Fallback text reading also failed:', textError.message);
          throw new Error('Unable to read DOCX file. The file may be corrupted or in an unsupported format.');
        }
      }

      // Parse the text to extract entries
      const entries = this.parseDocxContent(text);

      // Create list entries
      const createdEntries = [];
      for (const entryData of entries) {
        try {
          const entry = await ListEntry.create({
            ...entryData,
            listId,
            createdBy: req.admin?.id
          });
          createdEntries.push(entry);
        } catch (error) {
          console.error('Error creating entry:', entryData, error);
        }
      }

      // Delete the uploaded DOCX file
      try {
        await fs.unlink(docxFile.path);
      } catch (err) {
        console.warn('Could not delete DOCX file:', err.message);
      }

      res.json({
        success: true,
        message: `Successfully parsed and created ${createdEntries.length} entries`,
        data: {
          entries: createdEntries,
          totalParsed: entries.length,
          totalCreated: createdEntries.length
        }
      });
    } catch (error) {
      console.error('Parse DOCX file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to parse DOCX file',
        error: error.message
      });
    }
  }

  // Parse DOCX content to extract structured data
  parseDocxContent(text) {
    const entries = [];
    const lines = text.split('\n').filter(line => line.trim());
    console.log('=== Parsing DOCX Content ===');
    console.log('Total filtered lines:', lines.length);
    console.log('First 10 lines:', lines.slice(0, 10));

    // Try different parsing methods in order of specificity
    const structuredEntries = this.parseStructuredFormat(lines);
    if (structuredEntries.length > 0) {
      console.log('Using structured parsing, found entries:', structuredEntries.length);
      return structuredEntries;
    }

    const bankEntries = this.parseBankListFormat(lines);
    if (bankEntries.length > 0) {
      console.log('Using bank list parsing, found entries:', bankEntries.length);
      return bankEntries;
    }

    const tableFormatEntries = this.parseTableFormat(lines);
    if (tableFormatEntries.length > 0) {
      console.log('Using table format parsing, found entries:', tableFormatEntries.length);
      return tableFormatEntries;
    }

    const bulletListEntries = this.parseBulletListFormat(lines);
    if (bulletListEntries.length > 0) {
      console.log('Using bullet list parsing, found entries:', bulletListEntries.length);
      return bulletListEntries;
    }

    // Fallback to simple list parsing
    console.log('Other parsing methods failed, trying simple list parsing');
    const simpleEntries = this.parseSimpleListFormat(lines);
    if (simpleEntries.length > 0) {
      console.log('Using simple list parsing, found entries:', simpleEntries.length);
      return simpleEntries;
    }

    console.log('No entries found with any parsing method');
    return entries;
  }

  // Parse structured format with labels
  parseStructuredFormat(lines) {
    const entries = [];
    let currentEntry = {};
    let parsingEntry = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`Processing line ${i}:`, line);

      // Look for patterns that indicate a new entry (numbered entries)
      const rankMatch = line.match(/^(\d+)\.?\s*(.+)/);
      if (rankMatch) {
        console.log('Found numbered entry pattern:', line);

        // Save previous entry if exists
        if (parsingEntry && currentEntry.name) {
          console.log('Saving previous entry:', currentEntry);
          entries.push({ ...currentEntry });
        }

        // Start new entry
        parsingEntry = true;
        currentEntry = {};

        // Extract rank and name
        currentEntry.rank = parseInt(rankMatch[1]);
        currentEntry.name = rankMatch[2].trim();
        console.log('Extracted rank and name:', currentEntry.rank, currentEntry.name);

        // Look ahead to parse fields for this entry
        let fieldIndex = i + 1;
        while (fieldIndex < lines.length) {
          const fieldLine = lines[fieldIndex].trim();
          console.log(`Processing field line ${fieldIndex}:`, fieldLine);

          // Stop if we find another numbered entry or blank line
          if (fieldLine.match(/^\d+\.?\s*.+/) || fieldLine === '') {
            console.log('Stopping field parsing at line:', fieldIndex);
            break;
          }

          // Parse field
          const lowerFieldLine = fieldLine.toLowerCase();

          if (lowerFieldLine.includes('company') || lowerFieldLine.includes('organization') || lowerFieldLine.includes('firm') || lowerFieldLine.includes('bank')) {
            currentEntry.company = this.extractFieldValue(fieldLine);
            console.log('Extracted company:', currentEntry.company);
          } else if (lowerFieldLine.includes('designation') || lowerFieldLine.includes('position') || lowerFieldLine.includes('title') || lowerFieldLine.includes('role') || lowerFieldLine.includes('ceo') || lowerFieldLine.includes('chairman') || lowerFieldLine.includes('president')) {
            currentEntry.designation = this.extractFieldValue(fieldLine);
            console.log('Extracted designation:', currentEntry.designation);
          } else if (lowerFieldLine.includes('residence') || lowerFieldLine.includes('location') || lowerFieldLine.includes('city') || lowerFieldLine.includes('country') || lowerFieldLine.includes('based')) {
            currentEntry.residence = this.extractFieldValue(fieldLine);
            console.log('Extracted residence:', currentEntry.residence);
          } else if (lowerFieldLine.includes('nationality') || lowerFieldLine.includes('citizen')) {
            currentEntry.nationality = this.extractFieldValue(fieldLine);
            console.log('Extracted nationality:', currentEntry.nationality);
          } else if (lowerFieldLine.includes('category') || lowerFieldLine.includes('industry') || lowerFieldLine.includes('sector')) {
            currentEntry.category = this.extractFieldValue(fieldLine);
            console.log('Extracted category:', currentEntry.category);
          } else if (fieldLine.length > 10 && !fieldLine.includes(':') && !fieldLine.match(/^\d/)) {
            // Assume this is a description or additional info
            currentEntry.description = (currentEntry.description || '') + fieldLine + ' ';
            console.log('Added to description:', currentEntry.description);
          }

          fieldIndex++;
        }

        // Move the main index to continue after the fields
        i = fieldIndex - 1;
        console.log('Moving main index to:', i);
      }
    }

    // Save the last entry
    if (parsingEntry && currentEntry.name) {
      console.log('Saving last entry:', currentEntry);
      entries.push({ ...currentEntry });
    }

    console.log('Total entries parsed:', entries.length);
    return entries;
  }

  // Helper method to extract field values from labeled lines
  extractFieldValue(line) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      return line.substring(colonIndex + 1).trim();
    }

    // Try other separators
    const separators = [' - ', ' – ', ' — ', ': '];
    for (const sep of separators) {
      if (line.includes(sep)) {
        return line.split(sep)[1].trim();
      }
    }

    return line.trim();
  }

  // Parse table format (common in Word documents)
  parseTableFormat(lines) {
    const entries = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for table-like format with tabs or multiple spaces
      if (line.includes('\t') || line.includes('  ')) {
        const parts = line.split(/\t|\s{2,}/).filter(part => part.trim());
        if (parts.length >= 2) {
          const entry = {
            rank: entries.length + 1,
            name: parts[0].trim(),
            designation: parts[1].trim(),
            company: parts[2] ? parts[2].trim() : undefined
          };
          console.log('Parsed table entry:', entry);
          entries.push(entry);
        }
      }
    }

    return entries;
  }

  // Parse bullet list format
  parseBulletListFormat(lines) {
    const entries = [];
    const bulletPatterns = [/^[-•*]\s*/, /^\(\d+\)\s*/, /^[a-zA-Z]\.\s*/];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line starts with bullet or numbered pattern
      const hasBullet = bulletPatterns.some(pattern => pattern.test(line));
      if (hasBullet) {
        const cleanLine = line.replace(/^[-•*]\s*/, '').replace(/^\(\d+\)\s*/, '').replace(/^[a-zA-Z]\.\s*/, '').trim();

        if (cleanLine.length > 2) {
          const entry = {
            name: cleanLine,
            rank: entries.length + 1
          };
          console.log('Parsed bullet entry:', entry);
          entries.push(entry);
        }
      }
    }

    return entries;
  }

  // Parse simple list format (just names)
  parseSimpleListFormat(lines) {
    const entries = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for numbered entries
      const rankMatch = line.match(/^(\d+)\.?\s*(.+)/);
      if (rankMatch) {
        const entry = {
          rank: parseInt(rankMatch[1]),
          name: rankMatch[2].trim()
        };
        console.log('Parsed simple entry:', entry);
        entries.push(entry);
      } else if (line.length > 2 && line.length < 100 && /^[A-Z]/.test(line) && !line.includes(':') && entries.length < 50) {
        // Assume it's a name if it starts with capital letter and reasonable length
        // Skip lines that look like field labels
        const entry = {
          name: line,
          rank: entries.length + 1
        };
        console.log('Parsed name-only entry:', entry);
        entries.push(entry);
      }
    }

    return entries;
  }

  // Enhanced parsing for bank/financial institution lists
  parseBankListFormat(lines) {
    const entries = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for numbered bank entries
      const bankMatch = line.match(/^(\d+)\.?\s*(.+?)(?:\s*-\s*)?(.*)?$/);
      if (bankMatch) {
        const rank = parseInt(bankMatch[1]);
        const fullName = bankMatch[2].trim();
        const additionalInfo = bankMatch[3] ? bankMatch[3].trim() : '';

        // Try to extract company and person names
        let name = fullName;
        let company = '';

        // Common patterns for bank lists
        if (fullName.includes('Bank') || fullName.includes('Group') || fullName.includes('Corporation')) {
          company = fullName;
          name = additionalInfo || 'CEO'; // Default to CEO if no person specified
        } else if (additionalInfo) {
          company = additionalInfo;
        }

        const entry = {
          rank: rank,
          name: name,
          company: company,
          designation: 'CEO', // Default designation for banks
          category: 'Banking'
        };

        console.log('Parsed bank entry:', entry);
        entries.push(entry);
      }
    }

    return entries;
  }

  // Generate JSON-LD structured data for lists
  generateStructuredData(list) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const listUrl = `${baseUrl}/list/${list.id}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": list.title,
      "description": list.description || list.content?.substring(0, 200) || '',
      "url": listUrl,
      "numberOfItems": list.entries?.length || 0,
      "itemListElement": list.entries?.map((entry, index) => ({
        "@type": "ListItem",
        "position": entry.rank || index + 1,
        "item": {
          "@type": "Person",
          "name": entry.name,
          "jobTitle": entry.designation,
          "worksFor": entry.company ? {
            "@type": "Organization",
            "name": entry.company
          } : undefined,
          "address": entry.residence ? {
            "@type": "PostalAddress",
            "addressLocality": entry.residence
          } : undefined,
          "nationality": entry.nationality ? {
            "@type": "Country",
            "name": entry.nationality
          } : undefined,
          "description": entry.description
        }
      })) || []
    };

    // Remove undefined values
    const cleanStructuredData = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanStructuredData(obj[key]);
        }
      });
    };

    cleanStructuredData(structuredData);
    return structuredData;
  }

  // Permission check methods
  checkEditPermission(list, userId, admin) {
    // Allow editing if user created the list or is admin
    return list.createdBy === userId || admin?.role === 'Master Admin';
  }

  checkDeletePermission(list, userId, admin) {
    // Only allow deletion by creator or master admin
    return list.createdBy === userId || admin?.role === 'Master Admin';
  }

  // Create sample entries when DOCX parsing fails
  async createSampleEntries(listId, userId) {
    const sampleData = [
      {
        name: 'John Smith',
        rank: 1,
        designation: 'Chief Executive Officer',
        company: 'Sample Company 1',
        residence: 'New York, USA',
        description: 'Experienced CEO leading innovation in the industry.',
        nationality: 'American',
        category: 'Business'
      },
      {
        name: 'Sarah Johnson',
        rank: 2,
        designation: 'President',
        company: 'Sample Company 2',
        residence: 'London, UK',
        description: 'Dynamic leader with expertise in strategic planning.',
        nationality: 'British',
        category: 'Business'
      },
      {
        name: 'Michael Chen',
        rank: 3,
        designation: 'Chief Operating Officer',
        company: 'Sample Company 3',
        residence: 'Singapore',
        description: 'Operations expert driving efficiency and growth.',
        nationality: 'Singaporean',
        category: 'Business'
      },
      {
        name: 'Emma Davis',
        rank: 4,
        designation: 'Chief Financial Officer',
        company: 'Sample Company 4',
        residence: 'Sydney, Australia',
        description: 'Financial strategist with global market experience.',
        nationality: 'Australian',
        category: 'Finance'
      },
      {
        name: 'David Wilson',
        rank: 5,
        designation: 'Chief Technology Officer',
        company: 'Sample Company 5',
        residence: 'San Francisco, USA',
        description: 'Technology innovator leading digital transformation.',
        nationality: 'American',
        category: 'Technology'
      }
    ];

    const createdEntries = [];

    for (const data of sampleData) {
      try {
        const entry = await ListEntry.create({
          listId,
          name: data.name,
          rank: data.rank,
          designation: data.designation,
          company: data.company,
          residence: data.residence,
          description: data.description,
          nationality: data.nationality,
          category: data.category,
          status: 'active',
          createdBy: userId
        });
        createdEntries.push(entry);
        console.log(`Created sample entry: ${data.name}`);
      } catch (error) {
        console.error('Error creating sample entry:', data.name, error.message);
      }
    }

    return createdEntries;
  }
}

module.exports = ListController;