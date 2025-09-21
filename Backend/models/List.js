const { DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const List = sequelize.define('List', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255]
      }
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    featuredImage: {
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
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    year: {
      type: DataTypes.ENUM('2026', '2025', '2024', '2023', '2022', '2021'),
      allowNull: true
    },
    recommended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    richLists: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    entrepreneurs: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    companies: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    leaders: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    entertainment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sports: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lifestyle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    methodology: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
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
      beforeCreate: async (list) => {
        // Auto-generate slug if not provided
        if (!list.slug) {
          list.slug = slugify(list.title, { lower: true, strict: true });
        }

        // Check for duplicate slugs and make unique
        let existingSlug = await List.findOne({ where: { slug: list.slug } });
        if (existingSlug) {
          let counter = 1;
          let uniqueSlug = `${list.slug}-${Date.now()}`;

          // Keep checking until we find a unique slug
          while (await List.findOne({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${list.slug}-${Date.now()}-${counter}`;
            counter++;
          }

          list.slug = uniqueSlug;
        }

        // Auto-generate meta title and description if not provided
        if (!list.metaTitle) {
          list.metaTitle = list.title;
        }
        if (!list.metaDescription && list.description) {
          list.metaDescription = list.description.substring(0, 160);
        }

        // Auto-generate alt text for featured image
        if (list.featuredImage && !list.imageAlt) {
          list.imageAlt = `Featured image for ${list.title}`;
        }
      },

      beforeUpdate: async (list) => {
        // Update slug if title changed
        if (list.changed('title')) {
          const newSlug = slugify(list.title, { lower: true, strict: true });

          // Check for duplicate slugs (excluding current record)
          const existingSlug = await List.findOne({
            where: {
              slug: newSlug,
              id: { [sequelize.Sequelize.Op.ne]: list.id }
            }
          });

          if (!existingSlug) {
            list.slug = newSlug;
          } else {
            // If duplicate found, make it unique
            let counter = 1;
            let uniqueSlug = `${newSlug}-${Date.now()}`;

            while (await List.findOne({
              where: {
                slug: uniqueSlug,
                id: { [sequelize.Sequelize.Op.ne]: list.id }
              }
            })) {
              uniqueSlug = `${newSlug}-${Date.now()}-${counter}`;
              counter++;
            }

            list.slug = uniqueSlug;
          }
        }
      }
    }
  });

  List.associate = (models) => {
    List.belongsTo(models.Admin, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    List.belongsTo(models.Admin, {
      foreignKey: 'updatedBy',
      as: 'updater'
    });

    List.hasMany(models.ListEntry, {
      foreignKey: 'listId',
      as: 'entries'
    });

    List.hasMany(models.PowerListEntry, {
      foreignKey: 'listId',
      as: 'powerListEntries'
    });
  };

  return List;
};