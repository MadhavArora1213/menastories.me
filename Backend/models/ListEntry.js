const { DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const ListEntry = sequelize.define('ListEntry', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    listId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Lists',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: null
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    residence: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Relative path to storage/list/images/'
    },
    imageCaption: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageAlt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metaDescription: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Admins',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Admins',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    underscored: false,
    hooks: {
      beforeCreate: async (entry) => {
        console.log('=== ListEntry beforeCreate hook triggered ===');
        console.log('Entry data:', entry.dataValues);
        console.log('Entry slug before:', entry.slug);

        // Auto-generate slug based on name
        if (!entry.slug) {
          entry.slug = slugify(entry.name, { lower: true, strict: true });
          console.log('Generated slug:', entry.slug);

          // Check for duplicate slugs within the same list
          const existingSlug = await ListEntry.findOne({
            where: {
              slug: entry.slug,
              listId: entry.listId
            }
          });

          if (existingSlug) {
            entry.slug = `${entry.slug}-${Date.now()}`;
            console.log('Modified slug for uniqueness:', entry.slug);
          }
        } else {
          console.log('Slug already provided:', entry.slug);
        }

        console.log('Final slug:', entry.slug);

        // Auto-generate meta title and description if not provided
        if (!entry.metaTitle) {
          entry.metaTitle = `${entry.name} - ${entry.designation || 'Professional'}`;
        }
        if (!entry.metaDescription && entry.description) {
          entry.metaDescription = entry.description.substring(0, 160);
        }

        // Auto-generate alt text for image
        if (entry.image && !entry.imageAlt) {
          entry.imageAlt = `Portrait of ${entry.name}`;
        }
      },

      beforeUpdate: async (entry) => {
        // Update slug if name changed
        if (entry.changed('name')) {
          const newSlug = slugify(entry.name, { lower: true, strict: true });
          const existingSlug = await ListEntry.findOne({
            where: {
              slug: newSlug,
              listId: entry.listId,
              id: { [sequelize.Op.ne]: entry.id }
            }
          });
          if (!existingSlug) {
            entry.slug = newSlug;
          }
        }
      }
    }
  });

  ListEntry.associate = (models) => {
    ListEntry.belongsTo(models.List, {
      foreignKey: 'listId',
      as: 'list'
    });

    ListEntry.belongsTo(models.Admin, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    ListEntry.belongsTo(models.Admin, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });
  };

  return ListEntry;
};