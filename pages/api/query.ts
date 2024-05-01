import { ChainBase } from '@/src/ChainBase'
import type { NextApiRequest, NextApiResponse } from 'next'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, headers } = req
  console.log('headers', headers)
  const customApiKey = headers['custom-api-key'] as string
  const cb = new ChainBase()

  if (customApiKey && customApiKey !== '') {
    cb.setCustomApiKey(customApiKey)
  }

  const { network, token_addr } = query

  if (method === 'GET') {
    let result = {}
    async function fetch() {
      result = await cb.getTopHolder(token_addr as string, network as string)
    }
    try {
      fetch().then(() => {
        console.log(result)
        res.status(200).json(result)
      })
    } catch (e) {}
  } else {
    res.statusCode = 405
    res.json({ name: `Method Not Allowed` })
  }
}
