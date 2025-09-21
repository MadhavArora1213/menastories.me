const { List, PowerListEntry, Admin } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const rssService = require('../services/rssService');
const mammoth = require('mammoth');

class PowerListController {
  constructor() {
    console.log('=== PowerListController constructor called ===');

    // Bind methods to preserve context
    this.getAllPowerLists = this.getAllPowerLists.bind(this);
    this.getPowerList = this.getPowerList.bind(this);
    this.createPowerList = this.createPowerList.bind(this);
    this.updatePowerList = this.updatePowerList.bind(this);
    this.deletePowerList = this.deletePowerList.bind(this);
    this.getPowerListEntry = this.getPowerListEntry.bind(this);
    this.getPowerListEntries = this.getPowerListEntries.bind(this);
    this.createPowerListEntry = this.createPowerListEntry.bind(this);
    this.updatePowerListEntry = this.updatePowerListEntry.bind(this);
    this.deletePowerListEntry = this.deletePowerListEntry.bind(this);
    this.parseDocxFile = this.parseDocxFile.bind(this);
    this.generateStructuredData = this.generateStructuredData.bind(this);
    this.checkEditPermission = this.checkEditPermission.bind(this);
    this.checkDeletePermission = this.checkDeletePermission.bind(this);
  }

  // Get all power lists with filters and pagination
  async getAllPowerLists(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        year,
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
            model: PowerListEntry,
            as: 'powerListEntries',
            where: { status: 'active' },
            required: false,
            attributes: ['id', 'name', 'rank', 'designation', 'organization', 'category']
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
      console.error('Get power lists error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch power lists',
        error: error.message
      });
    }
  }

  // Get single power list by ID or slug
  async getPowerList(req, res) {
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
            model: PowerListEntry,
            as: 'powerListEntries',
            where: { status: 'active' },
            required: false,
            attributes: [
              'id', 'name', 'photo', 'designation', 'organization', 'category',
              'industry', 'location', 'nationality', 'age', 'gender', 'achievements',
              'shortBio', 'rank', 'metaTitle', 'metaDescription', 'status', 'createdAt'
            ],
            order: [['rank', 'ASC']]
          }
        ]
      });

      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'Power list not found'
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
      console.error('Get power list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch power list',
        error: error.message
      });
    }
  }

  // Create new power list
  async createPowerList(req, res) {
    try {
      console.log('=== Create Power List Debug ===');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('req.body:', req.body);
      console.log('req.files:', req.files);
      console.log('req.body keys:', Object.keys(req.body));

      // Extract fields
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
            featuredImagePath = `/var/www/menastories/menastories.me/Backend/storage/images/${processedFilename}`;
            console.log('✅ Featured image processed:', processedFilename);
          } catch (imageError) {
            console.error('❌ Image processing error:', imageError);
            featuredImagePath = `/var/www/menastories/menastories.me/Backend/storage/images/${featuredImageFile.filename}`;
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

      console.log('Creating power list with data:', listData);
      const list = await List.create(listData);

      // Parse DOCX file and create power list entries if provided
      console.log('=== DOCX Processing Section ===');
      let docxFile = null;

      if (req.files) {
        docxFile = req.files.find(file => file.fieldname === 'docx_file');
        console.log('docxFile found:', !!docxFile);
      }

      // Validate that DOCX file is provided
      if (!docxFile) {
        console.log('DOCX file validation failed: no file provided');
        return res.status(400).json({
          success: false,
          message: 'DOCX file is required for creating power list entries'
        });
      }

      try {
        console.log('Parsing DOCX file for power list entries:', docxFile.filename);

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

        // Parse the text to extract power list entries
        const entries = this.parsePowerListDocxContent(text);
        console.log('Parsed power list entries:', entries);

        // Validate that entries were found
        if (entries.length === 0) {
          console.log('No entries found in DOCX file');
          return res.status(400).json({
            success: false,
            message: 'No valid entries found in the DOCX file. Please ensure the file contains properly formatted power list entries.'
          });
        }

        // Create power list entries
        const createdEntries = [];
        for (const entryData of entries) {
          try {
            console.log('Creating power list entry with data:', {
              ...entryData,
              listId: list.id,
              createdBy: userId
            });

            // Ensure required fields are present
            if (!entryData.name || entryData.name.trim() === '') {
              console.log('Skipping entry with missing name:', entryData);
              continue;
            }

            const entry = await PowerListEntry.create({
              ...entryData,
              listId: list.id,
              createdBy: userId,
              status: 'active'
            });
            console.log('Successfully created power list entry:', entry.id);
            createdEntries.push(entry);
          } catch (error) {
            console.error('Error creating power list entry:', entryData, error);
            console.error('Entry creation error details:', error.message);
          }
        }

        console.log(`Created ${createdEntries.length} power list entries from DOCX`);

        if (createdEntries.length === 0) {
          console.log('Failed to create any power list entries from DOCX');
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
            model: PowerListEntry,
            as: 'powerListEntries',
            where: { status: 'active' },
            required: false,
            attributes: [
              'id', 'name', 'photo', 'designation', 'organization', 'category',
              'industry', 'location', 'nationality', 'age', 'gender', 'achievements',
              'shortBio', 'rank', 'metaTitle', 'metaDescription', 'status', 'createdAt'
            ],
            order: [['rank', 'ASC']]
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Power list created successfully',
        data: completeList
      });
    } catch (error) {
      console.error('Create power list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create power list',
        error: error.message
      });
    }
  }

  // Update power list
  async updatePowerList(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const list = await List.findByPk(id);
      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'Power list not found'
        });
      }

      // Check permissions
      const canEdit = this.checkEditPermission(list, userId, req.admin);
      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to edit this power list. Only the creator of the list or a Master Admin can edit power lists.'
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
            featuredImagePath = `/var/www/menastories/menastories.me/Backend/storage/images/${processedFilename}`;

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
            featuredImagePath = `/var/www/menastories/menastories.me/Backend/storage/images/${featuredImageFile.filename}`;
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
          { model: Admin, as: 'creator' },
          {
            model: PowerListEntry,
            as: 'powerListEntries',
            where: { status: 'active' },
            required: false,
            attributes: ['id', 'name', 'rank', 'designation', 'organization', 'category']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Power list updated successfully',
        data: updatedList
      });
    } catch (error) {
      console.error('Update power list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update power list',
        error: error.message
      });
    }
  }

  // Delete power list
  async deletePowerList(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const list = await List.findByPk(id);
      if (!list) {
        return res.status(404).json({
          success: false,
          message: 'Power list not found'
        });
      }

      // Check permissions
      const canDelete = this.checkDeletePermission(list, userId, req.admin);
      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to delete this power list. Only the creator of the list or a Master Admin can delete power lists.'
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
        message: 'Power list deleted successfully'
      });
    } catch (error) {
      console.error('Delete power list error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete power list',
        error: error.message
      });
    }
  }

  // Get single power list entry by ID
  async getPowerListEntry(req, res) {
    try {
      const { id } = req.params;

      const entry = await PowerListEntry.findByPk(id, {
        attributes: [
          'id', 'listId', 'name', 'photo', 'designation', 'organization', 'category',
          'industry', 'location', 'nationality', 'age', 'gender', 'achievements',
          'shortBio', 'rank', 'metaTitle', 'metaDescription', 'status', 'createdAt'
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
          message: 'Power list entry not found'
        });
      }

      res.json({
        success: true,
        data: entry
      });
    } catch (error) {
      console.error('Get power list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch power list entry',
        error: error.message
      });
    }
  }

  // Get power list entries for a specific list
  async getPowerListEntries(req, res) {
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
          { organization: { [Op.iLike]: `%${search}%` } },
          { achievements: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: entries } = await PowerListEntry.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'name', 'photo', 'designation', 'organization', 'category',
          'industry', 'location', 'nationality', 'age', 'gender', 'achievements',
          'shortBio', 'rank', 'metaTitle', 'metaDescription', 'status', 'createdAt'
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
      console.error('Get power list entries error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch power list entries',
        error: error.message
      });
    }
  }

  // Create power list entry
  async createPowerListEntry(req, res) {
    try {
      const { listId } = req.params;
      const {
        name,
        rank,
        designation,
        organization,
        category,
        industry,
        location,
        nationality,
        age,
        gender,
        achievements,
        shortBio,
        meta_title,
        meta_description
      } = req.body;

      const userId = req.admin?.id;

      // Validate required fields
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Name is required'
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

      // Handle photo upload
      let photoPath = null;
      if (req.file && req.file.fieldname === 'photo') {
        const { ImageUploadService } = require('../services/imageUploadService');
        const imageService = new ImageUploadService();
        const processedFilename = await imageService.processImage(req.file.path, {
          width: 400,
          height: 400,
          quality: 85,
          format: 'webp'
        });
        photoPath = `/var/www/menastories/menastories.me/Backend/storage/images/${processedFilename}`;
      }

      // Create power list entry
      const entryData = {
        listId,
        name,
        photo: photoPath,
        rank: rank ? parseInt(rank) : null,
        designation,
        organization,
        category,
        industry,
        location,
        nationality,
        age: age ? parseInt(age) : null,
        gender,
        achievements,
        shortBio,
        metaTitle: meta_title,
        metaDescription: meta_description,
        status: 'active',
        createdBy: userId
      };

      const entry = await PowerListEntry.create(entryData);

      // Update RSS feed if list is published
      if (list.status === 'published') {
        await rssService.updateRSSFeed();
      }

      res.status(201).json({
        success: true,
        message: 'Power list entry created successfully',
        data: entry
      });
    } catch (error) {
      console.error('Create power list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create power list entry',
        error: error.message
      });
    }
  }

  // Update power list entry
  async updatePowerListEntry(req, res) {
    try {
      const { id } = req.params;
      const userId = req.admin?.id;

      const entry = await PowerListEntry.findByPk(id);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Power list entry not found'
        });
      }

      // Handle photo upload
      let photoPath = entry.photo;
      if (req.file && req.file.fieldname === 'photo') {
        const fileName = req.file.filename;
        photoPath = `/var/www/menastories/menastories.me/Backend/storage/images/${fileName}`;

        // Delete old photo if exists
        if (entry.photo) {
          try {
            await fs.unlink(path.join(__dirname, '..', entry.photo));
          } catch (err) {
            console.warn('Could not delete old photo:', err.message);
          }
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: userId,
        photo: photoPath,
        age: req.body.age ? parseInt(req.body.age) : null
      };

      // Handle empty strings for optional text fields
      if (updateData.achievements === '') {
        updateData.achievements = null;
      }
      if (updateData.shortBio === '') {
        updateData.shortBio = null;
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
        message: 'Power list entry updated successfully',
        data: entry
      });
    } catch (error) {
      console.error('Update power list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update power list entry',
        error: error.message
      });
    }
  }

  // Delete power list entry
  async deletePowerListEntry(req, res) {
    try {
      const { id } = req.params;

      const entry = await PowerListEntry.findByPk(id);
      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Power list entry not found'
        });
      }

      // Check if the list is published to update RSS feed
      const list = await List.findByPk(entry.listId);
      const wasPublished = list && list.status === 'published';

      // Delete associated photo
      if (entry.photo) {
        try {
          await fs.unlink(path.join(__dirname, '..', entry.photo));
        } catch (err) {
          console.warn('Could not delete photo:', err.message);
        }
      }

      await entry.destroy();

      // Update RSS feed if list is published
      if (wasPublished) {
        await rssService.updateRSSFeed();
      }

      res.json({
        success: true,
        message: 'Power list entry deleted successfully'
      });
    } catch (error) {
      console.error('Delete power list entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete power list entry',
        error: error.message
      });
    }
  }

  // Parse DOCX file and create power list entries
  async parseDocxFile(req, res) {
    try {
      const { listId } = req.params;

      if (!req.file || req.file.fieldname !== 'docx_file') {
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
        const result = await mammoth.extractRawText({ path: req.file.path });
        text = result.value;
        console.log('Successfully extracted text from DOCX');
      } catch (docxError) {
        console.error('DOCX parsing failed:', docxError.message);
        // Try to read as plain text file as fallback
        try {
          const fs = require('fs').promises;
          text = await fs.readFile(req.file.path, 'utf8');
          console.log('Fallback: Read file as plain text');
        } catch (textError) {
          console.error('Fallback text reading also failed:', textError.message);
          throw new Error('Unable to read DOCX file. The file may be corrupted or in an unsupported format.');
        }
      }

      // Parse the text to extract power list entries
      const entries = this.parsePowerListDocxContent(text);

      // Create power list entries
      const createdEntries = [];
      for (const entryData of entries) {
        try {
          const entry = await PowerListEntry.create({
            ...entryData,
            listId,
            createdBy: req.admin?.id
          });
          createdEntries.push(entry);
        } catch (error) {
          console.error('Error creating power list entry:', entryData, error);
        }
      }

      // Delete the uploaded DOCX file
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.warn('Could not delete DOCX file:', err.message);
      }

      res.json({
        success: true,
        message: `Successfully parsed and created ${createdEntries.length} power list entries`,
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

  // Enhanced parsing for power list DOCX content
  parsePowerListDocxContent(text) {
    const entries = [];
    const lines = text.split('\n').filter(line => line.trim());
    console.log('=== Parsing Power List DOCX Content ===');
    console.log('Total filtered lines:', lines.length);

    // Try different parsing methods in order of specificity
    const structuredEntries = this.parsePowerListStructuredFormat(lines);
    if (structuredEntries.length > 0) {
      console.log('Using structured parsing, found entries:', structuredEntries.length);
      return structuredEntries;
    }

    const forbesEntries = this.parseForbesStyleFormat(lines);
    if (forbesEntries.length > 0) {
      console.log('Using Forbes-style parsing, found entries:', forbesEntries.length);
      return forbesEntries;
    }

    const tableFormatEntries = this.parsePowerListTableFormat(lines);
    if (tableFormatEntries.length > 0) {
      console.log('Using table format parsing, found entries:', tableFormatEntries.length);
      return tableFormatEntries;
    }

    const bulletListEntries = this.parsePowerListBulletListFormat(lines);
    if (bulletListEntries.length > 0) {
      console.log('Using bullet list parsing, found entries:', bulletListEntries.length);
      return bulletListEntries;
    }

    // Fallback to simple list parsing
    console.log('Other parsing methods failed, trying simple list parsing');
    const simpleEntries = this.parsePowerListSimpleListFormat(lines);
    if (simpleEntries.length > 0) {
      console.log('Using simple list parsing, found entries:', simpleEntries.length);
      return simpleEntries;
    }

    console.log('No entries found with any parsing method');
    return entries;
  }

  // Parse structured format with detailed labels for power lists
  parsePowerListStructuredFormat(lines) {
    const entries = [];
    let currentEntry = {};
    let parsingEntry = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for patterns that indicate a new entry (numbered entries)
      const rankMatch = line.match(/^(\d+)\.?\s*(.+)/);
      if (rankMatch) {
        // Save previous entry if exists
        if (parsingEntry && currentEntry.name) {
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

          // Stop if we find another numbered entry or blank line
          if (fieldLine.match(/^\d+\.?\s*.+/) || fieldLine === '') {
            break;
          }

          // Parse field
          const lowerFieldLine = fieldLine.toLowerCase();

          if (lowerFieldLine.includes('designation') || lowerFieldLine.includes('position') || lowerFieldLine.includes('title') || lowerFieldLine.includes('role')) {
            currentEntry.designation = this.extractFieldValue(fieldLine);
          } else if (lowerFieldLine.includes('organization') || lowerFieldLine.includes('company') || lowerFieldLine.includes('firm')) {
            currentEntry.organization = this.extractFieldValue(fieldLine);
          } else if (lowerFieldLine.includes('industry') || lowerFieldLine.includes('sector')) {
            currentEntry.industry = this.extractFieldValue(fieldLine);
          } else if (lowerFieldLine.includes('location') || lowerFieldLine.includes('city') || lowerFieldLine.includes('country')) {
            currentEntry.location = this.extractFieldValue(fieldLine);
          } else if (lowerFieldLine.includes('nationality') || lowerFieldLine.includes('citizen')) {
            currentEntry.nationality = this.extractFieldValue(fieldLine);
          } else if (lowerFieldLine.includes('age')) {
            const ageMatch = fieldLine.match(/(\d+)/);
            if (ageMatch) {
              currentEntry.age = parseInt(ageMatch[1]);
            }
          } else if (lowerFieldLine.includes('category') || lowerFieldLine.includes('type')) {
            currentEntry.category = this.extractFieldValue(fieldLine);
          } else if (lowerFieldLine.includes('achievements') || lowerFieldLine.includes('accomplishments')) {
            currentEntry.achievements = (currentEntry.achievements || '') + fieldLine + ' ';
          } else if (fieldLine.length > 20 && !fieldLine.includes(':') && !fieldLine.match(/^\d/)) {
            // Assume this is a bio or description
            currentEntry.shortBio = (currentEntry.shortBio || '') + fieldLine + ' ';
          }

          fieldIndex++;
        }

        // Move the main index to continue after the fields
        i = fieldIndex - 1;
      }
    }

    // Save the last entry
    if (parsingEntry && currentEntry.name) {
      entries.push({ ...currentEntry });
    }

    return entries;
  }

  // Parse Forbes-style format (like 30 Under 30)
  parseForbesStyleFormat(lines) {
    const entries = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for Forbes-style entries
      const forbesMatch = line.match(/^(\d+)\.\s*(.+?)(?:\s*,\s*(.+?))?(?:\s*\((.+?)\))?$/);
      if (forbesMatch) {
        const rank = parseInt(forbesMatch[1]);
        const name = forbesMatch[2].trim();
        const organization = forbesMatch[3] ? forbesMatch[3].trim() : '';
        const additionalInfo = forbesMatch[4] ? forbesMatch[4].trim() : '';

        const entry = {
          rank: rank,
          name: name,
          organization: organization,
          designation: additionalInfo || 'CEO',
          category: 'Business',
          achievements: `Ranked #${rank} in the power list`
        };

        entries.push(entry);
      }
    }

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
  parsePowerListTableFormat(lines) {
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
            organization: parts[2] ? parts[2].trim() : undefined,
            category: 'Business'
          };
          entries.push(entry);
        }
      }
    }

    return entries;
  }

  // Parse bullet list format
  parsePowerListBulletListFormat(lines) {
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
            rank: entries.length + 1,
            category: 'Business'
          };
          entries.push(entry);
        }
      }
    }

    return entries;
  }

  // Parse simple list format (just names)
  parsePowerListSimpleListFormat(lines) {
    const entries = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for numbered entries
      const rankMatch = line.match(/^(\d+)\.?\s*(.+)/);
      if (rankMatch) {
        const entry = {
          rank: parseInt(rankMatch[1]),
          name: rankMatch[2].trim(),
          category: 'Business'
        };
        entries.push(entry);
      } else if (line.length > 2 && line.length < 100 && /^[A-Z]/.test(line) && !line.includes(':') && entries.length < 50) {
        // Assume it's a name if it starts with capital letter and reasonable length
        const entry = {
          name: line,
          rank: entries.length + 1,
          category: 'Business'
        };
        entries.push(entry);
      }
    }

    return entries;
  }

  // Generate JSON-LD structured data for power lists
  generateStructuredData(list) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const listUrl = `${baseUrl}/power-list/${list.id}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": list.title,
      "description": list.description || list.content?.substring(0, 200) || '',
      "url": listUrl,
      "numberOfItems": list.powerListEntries?.length || 0,
      "itemListElement": list.powerListEntries?.map((entry, index) => ({
        "@type": "ListItem",
        "position": entry.rank || index + 1,
        "item": {
          "@type": "Person",
          "name": entry.name,
          "jobTitle": entry.designation,
          "worksFor": entry.organization ? {
            "@type": "Organization",
            "name": entry.organization,
            "industry": entry.industry
          } : undefined,
          "address": entry.location ? {
            "@type": "PostalAddress",
            "addressLocality": entry.location
          } : undefined,
          "nationality": entry.nationality ? {
            "@type": "Country",
            "name": entry.nationality
          } : undefined,
          "description": entry.achievements || entry.shortBio,
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Category",
              "value": entry.category
            },
            {
              "@type": "PropertyValue",
              "name": "Age",
              "value": entry.age
            }
          ].filter(prop => prop.value)
        }
      })) || []
    };

    return structuredData;
  }

  // Permission check methods
  checkEditPermission(list, userId, admin) {
    // Allow editing if user created the list or is admin
    return list.createdBy === userId || admin?.role?.name === 'Master Admin';
  }

  checkDeletePermission(list, userId, admin) {
    // Only allow deletion by creator or master admin
    return list.createdBy === userId || admin?.role?.name === 'Master Admin';
  }
}

module.exports = PowerListController;