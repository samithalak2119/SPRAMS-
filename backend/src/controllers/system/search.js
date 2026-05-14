const Project = require('../../models/Project');
const ResearchEntry = require('../../models/ResearchEntry');
const claudeService = require('../../services/claudeService');

// @desc    Unified search across projects and research
// @route   GET /api/search
// @access  Private (all roles)
const search = async (req, res, next) => {
    try {
        const { q, type = 'all', department, year, fileType, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const results = { projects: [], research: [], suggestions: [] };
        const textQuery = q ? { $text: { $search: q } } : {};

        // Fetch AI keyword suggestions (only if query provided)
        let aiSuggestions = [];
        if (q && q.trim().length > 2) {
            try {
                aiSuggestions = await claudeService.expandSearchQuery(q);
            } catch (err) {
                console.warn('Search query expansion failed:', err.message);
            }
        }

        // Search projects
        if (type === 'all' || type === 'projects') {
            let projectFilter = {};

            if (q) {
                const searchRegex = { $regex: q, $options: 'i' };
                projectFilter.$or = [
                    { $text: { $search: q } },
                    { title: searchRegex },
                    { abstract: searchRegex },
                    { department: searchRegex },
                    { groupName: searchRegex },
                    { 'members.name': searchRegex }
                ];
            }

            if (department) projectFilter.department = { $regex: department, $options: 'i' };
            if (year) projectFilter.academicYear = { $regex: year };

            const sortOptions = q ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 };
            const selectOptions = q ? { score: { $meta: 'textScore' } } : {};

            results.projectsTotal = await Project.countDocuments(projectFilter);
            results.projects = await Project.find(projectFilter, selectOptions)
                .populate('createdBy', 'name email')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
        }

        // Search research entries
        if (type === 'all' || type === 'research') {
            let researchFilter = {};

            if (q) {
                const searchRegex = { $regex: q, $options: 'i' };
                researchFilter.$or = [
                    { $text: { $search: q } },
                    { title: searchRegex },
                    { description: searchRegex },
                    { aiSummary: searchRegex },
                    { tags: searchRegex }
                ];
            }

            if (year) researchFilter.year = parseInt(year);
            if (fileType) researchFilter['files.fileType'] = fileType;

            const sortOptions = q ? { score: { $meta: 'textScore' }, createdAt: -1 } : { createdAt: -1 };
            const selectOptions = q ? { score: { $meta: 'textScore' } } : {};

            results.researchTotal = await ResearchEntry.countDocuments(researchFilter);
            results.research = await ResearchEntry.find(researchFilter, selectOptions)
                .populate('authorId', 'name email')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
        }

        results.suggestions = aiSuggestions;

        res.json({
            success: true,
            data: {
                query: q,
                results,
                pagination: { page: parseInt(page), limit: parseInt(limit) },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { search };
