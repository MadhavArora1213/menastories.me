const { Admin, Role, Article, Event, AdminLoginLog, EventUpdate, Exhibition, NewsletterTemplate, NewsletterCampaign, WhatsAppCampaign, SecurityLog, SecurityIncident, BackupLog, SecuritySettings, EventRegistration, List, MediaKit } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Create new admin user (Master Admin only)
exports.createAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, name, roleId } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    // Verify role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // Create new admin
    const newAdmin = await Admin.create({
      email,
      password, // Will be hashed by model hook
      name,
      roleId,
      isActive: true
    });

    // Return new admin without password
    const adminData = {
      id: newAdmin.id,
      email: newAdmin.email,
      name: newAdmin.name,
      roleId: newAdmin.roleId,
      createdAt: newAdmin.createdAt
    };
    
    res.status(201).json({
      message: 'Admin user created successfully',
      admin: adminData
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all admin users
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });
    
    res.status(200).json({ admins });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'description']
      }]
    });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json({ admin });
  } catch (error) {
    console.error('Get admin by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, roleId, isActive } = req.body;
    const adminId = req.params.id;

    // Check if admin exists
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // If email is changing, check for duplicates
    if (email && email !== admin.email) {
      const existingEmail = await Admin.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // If role is changing, verify it exists
    if (roleId && roleId !== admin.roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role selected' });
      }
    }

    // Update admin
    await admin.update({
      name: name || admin.name,
      email: email || admin.email,
      roleId: roleId || admin.roleId,
      isActive: isActive !== undefined ? isActive : admin.isActive
    });

    const updatedAdmin = await Admin.findByPk(adminId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).json({
      message: 'Admin updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update admin password
exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(adminId)) {
      return res.status(400).json({ message: 'Invalid admin ID format' });
    }

    // Only allow password change for self or by Master Admin
    const isSelfUpdate = req.admin.id === adminId;
    const isMasterAdmin = req.admin.role?.name === 'Master Admin';

    if (!isSelfUpdate && !isMasterAdmin) {
      return res.status(403).json({ message: 'Not authorized to change this user\'s password' });
    }

    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // If it's a self update, verify current password
    if (isSelfUpdate) {
      const isMatch = await admin.checkPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Update password
    admin.password = newPassword; // Will be hashed by model hook
    await admin.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    // Prevent self-deletion and deletion of the last Master Admin
    if (req.admin.id === adminId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const admin = await Admin.findByPk(adminId, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // If deleting a Master Admin, ensure there's at least one other
    if (admin.role?.name === 'Master Admin') {
      const masterAdminCount = await Admin.count({
        include: [{
          model: Role,
          as: 'role',
          where: { name: 'Master Admin' }
        }]
      });

      if (masterAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only Master Admin' });
      }
    }

    // Handle foreign key constraints by setting references to NULL or replacement admin
    try {
      // Find a replacement admin (preferably a Master Admin) to use for non-nullable fields
      const replacementAdmin = await Admin.findOne({
        where: {
          id: { [Op.ne]: adminId },
          isActive: true
        },
        include: [{
          model: Role,
          as: 'role',
          where: { name: 'Master Admin' }
        }]
      });

      // If no Master Admin found, find any other active admin
      const fallbackAdmin = replacementAdmin || await Admin.findOne({
        where: {
          id: { [Op.ne]: adminId },
          isActive: true
        }
      });

      if (!fallbackAdmin) {
        return res.status(400).json({
          message: 'Cannot delete admin: No replacement admin available for required fields'
        });
      }

      // Update Articles that reference this admin
      // For non-nullable fields, use replacement admin; for nullable fields, use NULL
      await Article.update(
        {
          createdBy: fallbackAdmin.id,
          updatedBy: null,
          assignedTo: null
        },
        {
          where: {
            [Op.or]: [
              { createdBy: adminId },
              { updatedBy: adminId },
              { assignedTo: adminId }
            ]
          }
        }
      );

      // Update Events that reference this admin
      await Event.update(
        {
          createdBy: fallbackAdmin.id,
          reviewedBy: null
        },
        {
          where: {
            [Op.or]: [
              { createdBy: adminId },
              { reviewedBy: adminId }
            ]
          }
        }
      );

      // Update AdminLoginLog that reference this admin
      await AdminLoginLog.update(
        {
          adminId: fallbackAdmin.id
        },
        {
          where: { adminId: adminId }
        }
      );

      // Update EventUpdate that reference this admin
      await EventUpdate.update(
        {
          createdBy: fallbackAdmin.id
        },
        {
          where: { createdBy: adminId }
        }
      );

      // Update Exhibition that reference this admin
      await Exhibition.update(
        {
          createdBy: fallbackAdmin.id
        },
        {
          where: { createdBy: adminId }
        }
      );

      // Update List that reference this admin
      await List.update(
        {
          createdBy: fallbackAdmin.id,
          updatedBy: null
        },
        {
          where: {
            [Op.or]: [
              { createdBy: adminId },
              { updatedBy: adminId }
            ]
          }
        }
      );

      // Update MediaKit that reference this admin
      await MediaKit.update(
        {
          createdBy: fallbackAdmin.id,
          updatedBy: null
        },
        {
          where: {
            [Op.or]: [
              { createdBy: adminId },
              { updatedBy: adminId }
            ]
          }
        }
      );

      // Update NewsletterTemplate that reference this admin
      await NewsletterTemplate.update(
        {
          createdBy: fallbackAdmin.id,
          lastModifiedBy: null
        },
        {
          where: {
            [Op.or]: [
              { createdBy: adminId },
              { lastModifiedBy: adminId }
            ]
          }
        }
      );

      // Update NewsletterCampaign that reference this admin
      await NewsletterCampaign.update(
        {
          createdBy: fallbackAdmin.id
        },
        {
          where: { createdBy: adminId }
        }
      );

      // Update WhatsAppCampaign that reference this admin
      await WhatsAppCampaign.update(
        {
          createdBy: fallbackAdmin.id
        },
        {
          where: { createdBy: adminId }
        }
      );

      // Update SecurityLog that reference this admin
      await SecurityLog.update(
        {
          userId: null
        },
        {
          where: { userId: adminId }
        }
      );

      // Update SecurityIncident that reference this admin
      await SecurityIncident.update(
        {
          assignedTo: null
        },
        {
          where: { assignedTo: adminId }
        }
      );

      // Update BackupLog that reference this admin
      await BackupLog.update(
        {
          initiatedBy: null,
          verifiedBy: null
        },
        {
          where: {
            [Op.or]: [
              { initiatedBy: adminId },
              { verifiedBy: adminId }
            ]
          }
        }
      );

      // Update SecuritySettings that reference this admin
      await SecuritySettings.update(
        {
          lastModifiedBy: null
        },
        {
          where: { lastModifiedBy: adminId }
        }
      );

      // Update EventRegistration that reference this admin
      await EventRegistration.update(
        {
          userId: null,
          checkedInBy: null
        },
        {
          where: {
            [Op.or]: [
              { userId: adminId },
              { checkedInBy: adminId }
            ]
          }
        }
      );

    } catch (constraintError) {
      console.error('Error updating foreign key references:', constraintError);
      return res.status(500).json({ message: 'Error updating related records before deletion' });
    }

    await admin.destroy();

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAdmin: exports.createAdmin,
  getAllAdmins: exports.getAllAdmins,
  getAdminById: exports.getAdminById,
  updateAdmin: exports.updateAdmin,
  updatePassword: exports.updatePassword,
  deleteAdmin: exports.deleteAdmin
};