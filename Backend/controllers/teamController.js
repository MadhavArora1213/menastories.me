const { Team, TeamMember, Admin, Permission, Role } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, members } = req.body;
    
    // Create team with current admin as lead
    const team = await Team.create({
      name,
      description,
      leadId: req.admin.id
    });
    
    // Add lead as member
    await TeamMember.create({
      teamId: team.id,
      adminId: req.admin.id,
      role: 'Team Lead'
    });
    
    // Add additional members if provided
    if (members && members.length > 0) {
      const memberRecords = members.map(member => ({
        teamId: team.id,
        adminId: member.adminId,
        role: member.role || 'Member'
      }));
      
      await TeamMember.bulkCreate(memberRecords);
    }
    
    // Get complete team with members
    const teamWithMembers = await Team.findByPk(team.id, {
      include: [
        {
          model: Admin,
          as: 'lead',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        },
        {
          model: Admin,
          as: 'members',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email'],
          through: { attributes: ['role'] }
        }
      ]
    });
    
    res.status(201).json({
      message: 'Team created successfully',
      team: teamWithMembers
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        {
          model: Admin,
          as: 'lead',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Admin,
          as: 'members',
          attributes: ['id', 'username', 'firstName', 'lastName'],
          through: { attributes: ['role'] }
        }
      ]
    });
    
    res.status(200).json({ teams });
  } catch (error) {
    console.error('Get all teams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findByPk(id, {
      include: [
        {
          model: Admin,
          as: 'lead',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        },
        {
          model: Admin,
          as: 'members',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email'],
          through: { attributes: ['role'] }
        }
      ]
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.status(200).json({ team });
  } catch (error) {
    console.error('Get team by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, leadId } = req.body;
    
    const team = await Team.findByPk(id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team lead or Master Admin
    if (team.leadId !== req.admin.id && req.admin.role !== 'Master Admin') {
      return res.status(403).json({ message: 'You do not have permission to update this team' });
    }
    
    // Update team info
    await team.update({
      name: name || team.name,
      description: description !== undefined ? description : team.description,
      leadId: leadId || team.leadId
    });
    
    // If lead changed, update team member role
    if (leadId && leadId !== team.leadId) {
      // Check if new lead exists
      const newLead = await Admin.findByPk(leadId);
      if (!newLead) {
        return res.status(404).json({ message: 'New lead not found' });
      }
      
      // Check if new lead is already a team member
      const existingMember = await TeamMember.findOne({
        where: {
          teamId: id,
          adminId: leadId
        }
      });
      
      if (existingMember) {
        await existingMember.update({ role: 'Team Lead' });
      } else {
        await TeamMember.create({
          teamId: id,
          adminId: leadId,
          role: 'Team Lead'
        });
      }
      
      // Update old lead's role to Member
      await TeamMember.update(
        { role: 'Member' },
        {
          where: {
            teamId: id,
            adminId: team.leadId
          }
        }
      );
    }
    
    // Get updated team
    const updatedTeam = await Team.findByPk(id, {
      include: [
        {
          model: Admin,
          as: 'lead',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        },
        {
          model: Admin,
          as: 'members',
          attributes: ['id', 'username', 'firstName', 'lastName', 'email'],
          through: { attributes: ['role'] }
        }
      ]
    });
    
    res.status(200).json({
      message: 'Team updated successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add team member
exports.addTeamMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teamId, adminId, role } = req.body;
    
    // Check if team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team lead or Master Admin
    if (team.leadId !== req.admin.id && req.admin.role !== 'Master Admin') {
      return res.status(403).json({ message: 'You do not have permission to add members to this team' });
    }
    
    // Check if admin exists
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Check if admin is already a member
    const existingMember = await TeamMember.findOne({
      where: {
        teamId,
        adminId
      }
    });
    
    if (existingMember) {
      return res.status(400).json({ message: 'Admin is already a team member' });
    }
    
    // Add admin as team member
    const teamMember = await TeamMember.create({
      teamId,
      adminId,
      role: role || 'Member'
    });
    
    res.status(201).json({
      message: 'Team member added successfully',
      teamMember
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove team member
exports.removeTeamMember = async (req, res) => {
  try {
    const { teamId, adminId } = req.params;
    
    // Check if team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is team lead or Master Admin
    if (team.leadId !== req.admin.id && req.admin.role !== 'Master Admin') {
      return res.status(403).json({ message: 'You do not have permission to remove members from this team' });
    }
    
    // Cannot remove team lead
    if (adminId === team.leadId) {
      return res.status(400).json({ message: 'Cannot remove team lead. Assign a new lead first.' });
    }
    
    // Remove team member
    const deleted = await TeamMember.destroy({
      where: {
        teamId,
        adminId
      }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.status(200).json({
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};