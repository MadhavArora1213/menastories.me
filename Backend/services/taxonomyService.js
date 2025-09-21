const XLSX = require('xlsx');
const path = require('path');

class TaxonomyService {
  constructor() {
    this.taxonomyFile = path.join(__dirname, '../../taxonomy_master (2).xlsx');
    this.taxonomyData = null;
  }

  // Load taxonomy data from Excel file
  async loadTaxonomyData() {
    try {
      if (this.taxonomyData) {
        return this.taxonomyData;
      }

      const workbook = XLSX.readFile(this.taxonomyFile);
      this.taxonomyData = {};

      // Parse each sheet
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Convert sheet name to camelCase for API
        const key = sheetName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        this.taxonomyData[key] = data;
      });

      return this.taxonomyData;
    } catch (error) {
      console.error('Error loading taxonomy data:', error);
      throw new Error('Failed to load taxonomy data');
    }
  }

  // Get all taxonomy data
  async getAllTaxonomy() {
    return await this.loadTaxonomyData();
  }

  // Get specific taxonomy section
  async getTaxonomySection(sectionName) {
    const data = await this.loadTaxonomyData();
    const key = sectionName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return data[key] || [];
  }

  // Get sections data
  async getSections() {
    return await this.getTaxonomySection('sections');
  }

  // Get industries data
  async getIndustries() {
    return await this.getTaxonomySection('industries');
  }

  // Get industry subsectors
  async getIndustrySubsectors() {
    return await this.getTaxonomySection('industry_subsectors');
  }

  // Get roles data
  async getRoles() {
    return await this.getTaxonomySection('roles');
  }

  // Get regions data
  async getRegions() {
    return await this.getTaxonomySection('regions');
  }

  // Get countries data
  async getCountries() {
    return await this.getTaxonomySection('countries');
  }

  // Get generations data
  async getGenerations() {
    return await this.getTaxonomySection('generations');
  }

  // Get company sizes data
  async getCompanySizes() {
    return await this.getTaxonomySection('company_sizes');
  }

  // Get business stages data
  async getBusinessStages() {
    return await this.getTaxonomySection('business_stages');
  }

  // Get demographics data
  async getDemographics() {
    return await this.getTaxonomySection('demographics');
  }

  // Get topics data
  async getTopics() {
    return await this.getTaxonomySection('topics');
  }

  // Get tags data
  async getTags() {
    return await this.getTaxonomySection('tags');
  }

  // Get formatted options for dropdowns
  async getDropdownOptions(type) {
    const data = await this.getTaxonomySection(type);

    switch (type) {
      case 'sections':
        return data.map(item => ({
          value: item.SectionID,
          label: item.SectionName,
          description: item.Description
        }));

      case 'industries':
        return data.map(item => ({
          value: item.IndustryID,
          label: item.IndustryName,
          notes: item.Notes
        }));

      case 'roles':
        return data.map(item => ({
          value: item.RoleID,
          label: item.RoleName
        }));

      case 'regions':
        return data.map(item => ({
          value: item.RegionID,
          label: item.RegionName,
          notes: item.Notes
        }));

      case 'countries':
        return data.map(item => ({
          value: item.CountryCode,
          label: item.CountryName
        }));

      case 'generations':
        return data.map(item => ({
          value: item.Generation,
          label: item.Generation,
          birthYears: item.BirthYears,
          notes: item.Notes
        }));

      case 'company_sizes':
        return data.map(item => ({
          value: item.SizeTier,
          label: item.SizeTier,
          employees: item.EmployeesRange,
          revenue: item.RevenueGuideline
        }));

      case 'business_stages':
        return data.map(item => ({
          value: item.StageID,
          label: item.StageName,
          indicators: item.TypicalIndicators
        }));

      case 'demographics':
        return data.map(item => ({
          value: item.Tag,
          label: item.Tag,
          category: item.TagCategory
        }));

      case 'topics':
        return data.map(item => ({
          value: item.TopicID,
          label: item.TopicName
        }));

      case 'tags':
        return data.map(item => ({
          value: item.TagKey,
          label: item.TagKey,
          meaning: item.Meaning
        }));

      default:
        return data;
    }
  }

  // Get industry subsectors for a specific industry
  async getSubsectorsForIndustry(industryName) {
    const subsectors = await this.getIndustrySubsectors();
    return subsectors
      .filter(item => item.Industry === industryName)
      .map(item => item.Subsector);
  }

  // Auto-categorize article into sections and subcategories based on content
  async autoCategorizeArticle(articleData) {
    const sections = await this.getSections();
    const industries = await this.getIndustries();
    const roles = await this.getRoles();
    const topics = await this.getTopics();

    let suggestedSection = null;
    let suggestedSubcategory = null;
    const tags = [];

    // Determine section based on industry and position
    if (articleData.industry) {
      const industry = industries.find(ind => ind.IndustryName === articleData.industry);
      if (industry) {
        // Map industries to sections
        if (['Technology & IT', 'Finance & Insurance', 'Healthcare & Life Sciences'].includes(industry.IndustryName)) {
          suggestedSection = sections.find(s => s.SectionName === 'News');
        } else if (['Media & Entertainment', 'Lifestyle & Culture'].includes(industry.IndustryName)) {
          suggestedSection = sections.find(s => s.SectionName === 'Features');
        } else if (['Education & Training', 'Legal & Professional Services'].includes(industry.IndustryName)) {
          suggestedSection = sections.find(s => s.SectionName === 'Guides');
        }
      }
    }

    // Determine section based on position/role
    if (articleData.position) {
      const role = roles.find(r => r.RoleName === articleData.position);
      if (role) {
        // Executive roles -> Leadership content
        if (['Chief Executive Officer (CEO)', 'Chairman', 'Managing Director (MD)'].includes(role.RoleName)) {
          suggestedSection = sections.find(s => s.SectionName === 'Opinion');
          tags.push('Leadership & Management');
        }
        // Founder roles -> Entrepreneurship
        else if (role.RoleName.includes('Founder') || role.RoleName.includes('Entrepreneur')) {
          suggestedSection = sections.find(s => s.SectionName === 'Features');
          tags.push('Startups & Entrepreneurship');
        }
      }
    }

    // Default to News if no specific section determined
    if (!suggestedSection) {
      suggestedSection = sections.find(s => s.SectionName === 'News');
    }

    // Add relevant tags based on content
    if (articleData.industry) {
      const industryTopics = topics.filter(t =>
        t.TopicName.toLowerCase().includes(articleData.industry.toLowerCase().split(' ')[0])
      );
      industryTopics.forEach(topic => tags.push(topic.TopicName));
    }

    return {
      section: suggestedSection,
      subcategory: suggestedSubcategory,
      tags: [...new Set(tags)] // Remove duplicates
    };
  }

  // Get suggested articles based on taxonomy matching
  async getSuggestedArticles(articleData, existingArticles, limit = 5) {
    const suggestions = [];

    for (const existingArticle of existingArticles) {
      let score = 0;

      // Industry match
      if (articleData.industry && existingArticle.industry === articleData.industry) {
        score += 3;
      }

      // Position match
      if (articleData.position && existingArticle.position === articleData.position) {
        score += 2;
      }

      // Nationality match
      if (articleData.nationality && existingArticle.nationality === articleData.nationality) {
        score += 2;
      }

      // Age group match
      if (articleData.age && existingArticle.age === articleData.age) {
        score += 1;
      }

      // Gender match
      if (articleData.gender && existingArticle.gender === articleData.gender) {
        score += 1;
      }

      // Residency match
      if (articleData.residency && existingArticle.residency === articleData.residency) {
        score += 1;
      }

      // Ethnicity match
      if (articleData.ethnicity && existingArticle.ethnicity === articleData.ethnicity) {
        score += 1;
      }

      if (score > 0) {
        suggestions.push({
          article: existingArticle,
          score: score
        });
      }
    }

    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.article);
  }

  // Get section and subcategory suggestions for an article
  async getSectionSuggestions(articleData) {
    const sections = await this.getSections();
    const suggestions = [];

    // Based on industry
    if (articleData.industry) {
      if (['Technology & IT', 'Finance & Insurance', 'Healthcare & Life Sciences'].includes(articleData.industry)) {
        suggestions.push(sections.find(s => s.SectionName === 'News'));
        suggestions.push(sections.find(s => s.SectionName === 'Data & Research'));
      } else if (['Media & Entertainment', 'Lifestyle & Culture'].includes(articleData.industry)) {
        suggestions.push(sections.find(s => s.SectionName === 'Features'));
        suggestions.push(sections.find(s => s.SectionName === 'Multimedia'));
      }
    }

    // Based on position
    if (articleData.position) {
      if (articleData.position.includes('CEO') || articleData.position.includes('Chairman')) {
        suggestions.push(sections.find(s => s.SectionName === 'Opinion'));
      } else if (articleData.position.includes('Founder')) {
        suggestions.push(sections.find(s => s.SectionName === 'Features'));
      }
    }

    // Remove duplicates and return
    return [...new Set(suggestions.filter(Boolean))];
  }
}

module.exports = new TaxonomyService();