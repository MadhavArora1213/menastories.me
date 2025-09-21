const taxonomyService = require('../services/taxonomyService');

// Get all taxonomy data
exports.getAllTaxonomy = async (req, res) => {
  try {
    const taxonomyData = await taxonomyService.getAllTaxonomy();
    res.status(200).json({
      success: true,
      data: taxonomyData
    });
  } catch (error) {
    console.error('Get all taxonomy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load taxonomy data'
    });
  }
};

// Get specific taxonomy section
exports.getTaxonomySection = async (req, res) => {
  try {
    const { section } = req.params;
    const data = await taxonomyService.getTaxonomySection(section);
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Get taxonomy section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load taxonomy section'
    });
  }
};

// Get sections
exports.getSections = async (req, res) => {
  try {
    const sections = await taxonomyService.getSections();
    res.status(200).json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load sections'
    });
  }
};

// Get industries
exports.getIndustries = async (req, res) => {
  try {
    const industries = await taxonomyService.getIndustries();
    res.status(200).json({
      success: true,
      data: industries
    });
  } catch (error) {
    console.error('Get industries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load industries'
    });
  }
};

// Get industry subsectors
exports.getIndustrySubsectors = async (req, res) => {
  try {
    const subsectors = await taxonomyService.getIndustrySubsectors();
    res.status(200).json({
      success: true,
      data: subsectors
    });
  } catch (error) {
    console.error('Get industry subsectors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load industry subsectors'
    });
  }
};

// Get subsectors for specific industry
exports.getSubsectorsForIndustry = async (req, res) => {
  try {
    const { industryName } = req.params;
    const subsectors = await taxonomyService.getSubsectorsForIndustry(industryName);
    res.status(200).json({
      success: true,
      data: subsectors
    });
  } catch (error) {
    console.error('Get subsectors for industry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load subsectors for industry'
    });
  }
};

// Get roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await taxonomyService.getRoles();
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load roles'
    });
  }
};

// Get regions
exports.getRegions = async (req, res) => {
  try {
    const regions = await taxonomyService.getRegions();
    res.status(200).json({
      success: true,
      data: regions
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load regions'
    });
  }
};

// Get countries
exports.getCountries = async (req, res) => {
  try {
    const countries = await taxonomyService.getCountries();
    res.status(200).json({
      success: true,
      data: countries
    });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load countries'
    });
  }
};

// Get generations
exports.getGenerations = async (req, res) => {
  try {
    const generations = await taxonomyService.getGenerations();
    res.status(200).json({
      success: true,
      data: generations
    });
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load generations'
    });
  }
};

// Get company sizes
exports.getCompanySizes = async (req, res) => {
  try {
    const companySizes = await taxonomyService.getCompanySizes();
    res.status(200).json({
      success: true,
      data: companySizes
    });
  } catch (error) {
    console.error('Get company sizes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load company sizes'
    });
  }
};

// Get business stages
exports.getBusinessStages = async (req, res) => {
  try {
    const businessStages = await taxonomyService.getBusinessStages();
    res.status(200).json({
      success: true,
      data: businessStages
    });
  } catch (error) {
    console.error('Get business stages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load business stages'
    });
  }
};

// Get demographics
exports.getDemographics = async (req, res) => {
  try {
    const demographics = await taxonomyService.getDemographics();
    res.status(200).json({
      success: true,
      data: demographics
    });
  } catch (error) {
    console.error('Get demographics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load demographics'
    });
  }
};

// Get topics
exports.getTopics = async (req, res) => {
  try {
    const topics = await taxonomyService.getTopics();
    res.status(200).json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load topics'
    });
  }
};

// Get tags
exports.getTags = async (req, res) => {
  try {
    const tags = await taxonomyService.getTags();
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load tags'
    });
  }
};

// Get dropdown options for a specific type
exports.getDropdownOptions = async (req, res) => {
  try {
    const { type } = req.params;
    const options = await taxonomyService.getDropdownOptions(type);
    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Get dropdown options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dropdown options'
    });
  }
};