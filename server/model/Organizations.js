const db = require('./db');

module.exports = {
  async getOrg(id) {
    // needs type
    let fields = id 
      ? `org.*, ot.name,
      concat(contact.first_name, ' ', contact.last_name) as contact_name,
      contact.phone as contact_phone, contact.email as contact_email,
      concat(owner.first_name, ' ', owner.last_name) as owner_name`
      : 'org.name, org.district, org.logo_url';
    let tables = id
      ? `organization org
      INNER JOIN organization_type ot ON ot.id = org.organization_type_id
      LEFT JOIN organization_contact oc ON org.id = oc.organization_id
      LEFT JOIN "user" contact ON contact.id = oc.user_id
      LEFT JOIN organization_owner ow ON org.id = ow.organization_id
      LEFT JOIN "user" owner ON owner.id = oc.user_id`
      : 'organization org';
    let selectors = id
      ? `WHERE org.id = ${id}`
      : '';
    return db.query(`SELECT ${fields} FROM ${tables} ${selectors}`);
  },
  
  async getOrgUsers(id) {
    // make option for more detail on user?
    let fields = `u.first_name, u.last_name, u.email, u.phone, ut.name, nt.type`;
    let tables = `"user" u`;
    if (id !== undefined) {
      tables += ` INNER JOIN user_type ut ON u.user_type_id = ut.id
        INNER JOIN notifiication_type nt ON u.notification_type_id = nt.id`;
    }
    let selectors = `WHERE u.id = ${id}`; 
    return db.query(`SELECT (${fields}) FROM ${tables} ${selectors}`);
  },
  // -> check if name already exists
  async postOrg(body) {
    let fields = [];
    let values = [];

    Object.keys(body).forEach(field => {
      if (typeof field === 'string') fields.push(field);
      else throw Error('Invalid column');
      if (typeof body[field] === 'string') values.push(`'${body[field]}'`)
      else values.push(body[field])
    })

    return db.query(`INSERT INTO organization (${fields.join(', ')}) VALUES (${values.join(', ')})`)

  },
}