/**
 * Swagger configuration for the Group Chat API.
 * This configuration file sets up the Swagger documentation for the API.
 * 
 * The Swagger documentation provides a detailed description of the API endpoints,
 * including the request parameters, response formats, and authentication requirements.
 * 
 * The `swaggerJSDoc` library is used to generate the Swagger specification based on
 * the JSDoc comments in the route files.
 * 
 * The `options` object defines the basic information about the API, such as the title,
 * version, and description. It also specifies the path to the route files where the
 * JSDoc comments are located.
 * 
 * The generated Swagger specification is exported as `swaggerSpec` and can be used
 * to serve the Swagger UI or other tools that consume Swagger specifications.
 */
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Group Chat API',
            version: '1.0.0',
            description: 'API for a group chat application'
        },
    },
    apis: ['./src/routes/*.js'], // Adjust the path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;