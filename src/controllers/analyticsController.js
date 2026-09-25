const AnalyticsService = require('../services/AnalyticsService');

module.exports = {
    /** GET /analytics/summary?from&to */
    async summary(req, res, next) {
        try {
            res.json(await AnalyticsService.summary(req.user.id, req.query));
        } catch (err) {
            next(err);
        }
    },

    /** GET /analytics/by-category?type&from&to */
    async byCategory(req, res, next) {
        try {
            res.json(await AnalyticsService.byCategory(req.user.id, req.query));
        } catch (err) {
            next(err);
        }
    },

    /** GET /analytics/trend?months */
    async trend(req, res, next) {
        try {
            const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 24);
            res.json(await AnalyticsService.trend(req.user.id, { months }));
        } catch (err) {
            next(err);
        }
    },
};
