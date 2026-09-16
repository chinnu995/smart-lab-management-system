const db = require('./src/config/db');

async function addCLanguage() {
  try {
    const [existing] = await db.execute(`SELECT * FROM labs WHERE lab_name LIKE '%C %' OR lab_name = 'C' OR lab_name = 'C LANGUAGE'`);
    if (existing.length === 0) {
      const [res] = await db.execute(
        `INSERT INTO labs (lab_name, lab_code, location, capacity, status, in_charge) 
         VALUES ('C LANGUAGE', 'CL07', 'Block B - 109', 40, 'available', 1)`
      );
      console.log('✅ Successfully added C LANGUAGE to subjects/labs table:', res);
    } else {
      console.log('C Language already exists:', existing);
    }

    const [allLabs] = await db.execute('SELECT lab_id, lab_name, lab_code, location FROM labs ORDER BY lab_id');
    console.log('ALL CURRENT LABS:', allLabs);
  } catch (err) {
    console.error('Error adding C Language:', err);
  } finally {
    process.exit(0);
  }
}

addCLanguage();
