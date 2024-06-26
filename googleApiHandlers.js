// Function to read emails using Gmail API (replace with actual implementation)
const { google } = require('googleapis');

async function readEmails(accessToken) {
  
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/auth/google/callback" // Redirect URI (replace if needed)
    );
    oauth2Client.setCredentials({ access_token: accessToken });
  
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
    // Example: Retrieve a list of emails (replace with specific data fetching logic)
    try {
      const res = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['INBOX'] // Filter by label (optional)
      });
      return res.data.messages; // Replace with specific data you need (e.g., message details)
    } catch (err) {
      throw err;
    }
  }


  // Function to read specific email content
async function readEmailContent(accessToken, emailId) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/auth/google/callback" // Redirect URI (replace if needed)
    );
    oauth2Client.setCredentials({ access_token: accessToken });
  
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
    try {
      const res = await gmail.users.messages.get({
        userId: 'me',
        id: emailId
      });
      const payload = res.data.payload;
    //   return payload

      // Check for plain text content (modify for HTML handling)
      if(payload.body.data){
        const decodedData = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        return decodedData;
      }
      else if (payload.parts[0].body.data ) {
        const decodedData = Buffer.from(payload.parts[1].body.data, 'base64').toString('utf-8');
        return decodedData;
      } 
      else if (payload.parts[0].parts[1].body.data ) {
        const decodedData = Buffer.from(payload.parts[0].parts[1].body.data, 'base64').toString('utf-8');
        return decodedData;
      } 
      
      else {
        console.warn('Email content format not supported (text/plain expected)');
        return 'Email content format not supported'; // Or handle unsupported formats differently
      }
    }catch (err) {
      throw err;
    }
  }
  
  module.exports={readEmails,readEmailContent}