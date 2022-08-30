const AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-south-1'
})
const dynamodb = new AWS.Dynamodb.DocumentClient();
const dynamodbTableName = 'Employee-details';
const employee = '/employee';
const employees = '/employees';

exports.handler = async function(event) {
    console.log('Request event: ', event);
    let response;
    switch(true) {
      case event.httpMethod === 'GET' && event.path === employee:
        response = buildResponse(200);
        break;
      case event.httpMethod === 'GET' && event.path === employee:
        response = await getEmployee(event.queryStringParameters.employeeId);
        break;
      case event.httpMethod === 'GET' && event.path === employees:
        response = await getEmployees();
        break;
      case event.httpMethod === 'POST' && event.path === employee:
        response = await saveEmployee(JSON.parse(event.body));
        break;
      case event.httpMethod === 'DELETE' && event.path === employee:
        response = await deleteEmployee(JSON.parse(event.body).employeeId);
        break;
      default:
        response = buildResponse(404, '404 Not Found');
    }
    return response;
  }
  
  async function getEmployee(employeeId) {
    const params = {
      TableName: dynamodbTableName,
      Key: {
        'employeeId': employeeId
      }
    }
    return await dynamodb.get(params).promise().then((response) => {
      return buildResponse(200, response.Item);
    }, (error) => {
      console.error('error: ', error);
    });
  }
  
  async function getEmployees() {
    const params = {
      TableName: dynamodbTableName
    }
    const allEmployees = await scanDynamoRecords(params, []);
    const body = {
      employees: allEmployees
    }
    return buildResponse(200, body);
  }
  
  async function saveEmployee(requestBody) {
    const params = {
      TableName: dynamodbTableName,
      Item: requestBody
    }
    return await dynamodb.put(params).promise().then(() => {
      const body = {
        Operation: 'SAVE',
        Message: 'SUCCESS',
        Item: requestBody
      }
      return buildResponse(200, body);
    }, (error) => {
      console.error('error: ', error);
    })
  }

  async function deleteEmployee(employeeId) {
    const params = {
      TableName: dynamodbTableName,
      Key: {
        'employeeId': employeeId
      },
      ReturnValues: 'ALL_OLD'
    }
    return await dynamodb.delete(params).promise().then((response) => {
      const body = {
        Operation: 'DELETE',
        Message: 'SUCCESS',
        Item: response
      }
      return buildResponse(200, body);
    }, (error) => {
      console.error('error: ', error);
    })
  }
  
  function buildResponse(statusCode, body) {
    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  }
