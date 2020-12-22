const joi = require('@hapi/joi');

const authSchemaL = joi.object({

  email: joi.string()
            .email()
            .lowercase()
            .required(),

            password: joi.string()
            .min(4)
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

           repeat_password: joi.ref('password'),

          birthdate:  joi.date(),
})

module.exports = {
  authSchemaL, 
}