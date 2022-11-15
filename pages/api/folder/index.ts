import { NextApiResponse } from 'next'
import { Request } from '../../../types'
import { folder } from '../../../db'
import middleware from '../../../middleware/all'
import nc from 'next-connect'
import onError from '../../../middleware/error'

const handler = nc<Request, NextApiResponse>({
  onError,
})

handler.use(middleware)
handler.post(async (req, res) => {
  const newFolder = await folder.createFolder(req.db, { createdBy: req.user.id, name: req.body.name })
  res.send({ data: newFolder })
})

export default handler
