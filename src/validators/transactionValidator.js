const Joi = require('joi');

const transactionSchemas = {
    // Wallet Top-up (Purchase)
    topup: Joi.object({
        idempotencyKey: Joi.string().required().max(255),
        userId: Joi.string().required().max(50),
        assetTypeId: Joi.number().integer().positive().required(),
        amount: Joi.number().integer().positive().required(),
        referenceId: Joi.string().max(100).optional(),
        description: Joi.string().max(500).optional(),
        createdBy: Joi.string().max(50).required()
    }),

    // Bonus/Incentive
    bonus: Joi.object({
        idempotencyKey: Joi.string().required().max(255),
        userId: Joi.string().required().max(50),
        assetTypeId: Joi.number().integer().positive().required(),
        amount: Joi.number().integer().positive().required(),
        referenceId: Joi.string().max(100).optional(),
        description: Joi.string().max(500).optional(),
        createdBy: Joi.string().max(50).required()
    }),

    // Purchase/Spend
    spend: Joi.object({
        idempotencyKey: Joi.string().required().max(255),
        userId: Joi.string().required().max(50),
        assetTypeId: Joi.number().integer().positive().required(),
        amount: Joi.number().integer().positive().required(),
        referenceId: Joi.string().max(100).optional(),
        description: Joi.string().max(500).optional(),
        createdBy: Joi.string().max(50).required()
    }),

    // Get balance query params
    balanceQuery: Joi.object({
        userId: Joi.string().required().max(50),
        assetTypeId: Joi.number().integer().positive().required()
    }),

    // Transaction history query params
    historyQuery: Joi.object({
        userId: Joi.string().required().max(50),
        assetTypeId: Joi.number().integer().positive().optional(),
        limit: Joi.number().integer().positive().max(100).default(50),
        offset: Joi.number().integer().min(0).default(0)
    })
};

function validate(schema, data) {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errorMessage = error.details
            .map(detail => detail.message)
            .join(', ');
        throw new Error(`Validation error: ${errorMessage}`);
    }

    return value;
}

module.exports = {
    validate,
    schemas: transactionSchemas
};
