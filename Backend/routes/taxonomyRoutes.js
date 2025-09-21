const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/taxonomyController');

// Get all taxonomy data
router.get('/', taxonomyController.getAllTaxonomy);

// Get specific taxonomy section
router.get('/section/:section', taxonomyController.getTaxonomySection);

// Get sections
router.get('/sections', taxonomyController.getSections);

// Get industries
router.get('/industries', taxonomyController.getIndustries);

// Get industry subsectors
router.get('/industry-subsectors', taxonomyController.getIndustrySubsectors);

// Get subsectors for specific industry
router.get('/industry-subsectors/:industryName', taxonomyController.getSubsectorsForIndustry);

// Get roles
router.get('/roles', taxonomyController.getRoles);

// Get regions
router.get('/regions', taxonomyController.getRegions);

// Get countries
router.get('/countries', taxonomyController.getCountries);

// Get generations
router.get('/generations', taxonomyController.getGenerations);

// Get company sizes
router.get('/company-sizes', taxonomyController.getCompanySizes);

// Get business stages
router.get('/business-stages', taxonomyController.getBusinessStages);

// Get demographics
router.get('/demographics', taxonomyController.getDemographics);

// Get topics
router.get('/topics', taxonomyController.getTopics);

// Get tags
router.get('/tags', taxonomyController.getTags);

// Get dropdown options for a specific type
router.get('/dropdown/:type', taxonomyController.getDropdownOptions);

module.exports = router;