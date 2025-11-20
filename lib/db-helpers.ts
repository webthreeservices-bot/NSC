import { Pool } from 'pg'
import pool, { getClientWithTimeout } from './db-connection'

export type SqlQuery = {
  text: string
  values: any[]
}

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  let text = strings[0]
  const queryValues: any[] = []

  for (let i = 0; i < values.length; i++) {
    queryValues.push(values[i])
    text += `$${i + 1}` + strings[i + 1]
  }

  let client
  try {
    client = await getClientWithTimeout()
    const result = await client.query(text, queryValues)
    return result.rows
  } finally {
    if (client) client.release()
  }
}

export { pool }