import { Dialog, Pane, majorScale } from 'evergreen-ui'
import React, { FC, useState } from 'react'
import { connectToDB, doc, folder } from '../../db'
import { getSession, useSession } from 'next-auth/client'

import DocPane from '../../components/docPane'
import FolderList from '../../components/folderList'
import FolderPane from '../../components/folderPane'
import Logo from '../../components/logo'
import NewFolderButton from '../../components/newFolderButton'
import NewFolderDialog from '../../components/newFolderDialog'
import User from '../../components/user'
import { UserSession } from '../../types'
import { useRouter } from 'next/router'

const App: FC<{ folders?: any[]; activeFolder?: any; activeDoc?: any; activeDocs?: any[] }> = ({
  folders,
  activeDoc,
  activeFolder,
  activeDocs,
}) => {
  const router = useRouter()
  const [session, loading] = useSession()

  const [newFolderIsShown, setIsShown] = useState(false)
  const [allFolders, setFolders] = useState(folders || [])

  if (loading) return null

  const handleNewFolder = async (name: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/folder/`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const { data } = await res.json()
    setFolders((state) => [...state, data])
  }

  const Page = () => {
    if (activeDoc) {
      return <DocPane folder={activeFolder} doc={activeDoc} />
    }

    if (activeFolder) {
      return <FolderPane folder={activeFolder} docs={activeDocs} />
    }

    return null
  }

  if (!session && !loading) {
    return (
      <Dialog
        isShown
        title="Session expired"
        confirmLabel="Ok"
        hasCancel={false}
        hasClose={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
        onConfirm={() => router.push('/signin')}
      >
        Sign in to continue
      </Dialog>
    )
  }

  return (
    <Pane position="relative">
      <Pane width={300} position="absolute" top={0} left={0} background="tint2" height="100vh" borderRight>
        <Pane padding={majorScale(2)} display="flex" alignItems="center" justifyContent="space-between">
          <Logo />

          <NewFolderButton onClick={() => setIsShown(true)} />
        </Pane>
        <Pane>
          <FolderList folders={allFolders} />{' '}
        </Pane>
      </Pane>
      <Pane marginLeft={300} width="calc(100vw - 300px)" height="100vh" overflowY="auto" position="relative">
        <User user={session.user} />
        <Page />
      </Pane>
      <NewFolderDialog close={() => setIsShown(false)} isShown={newFolderIsShown} onNewFolder={handleNewFolder} />
    </Pane>
  )
}

export async function getServerSideProps(context) {
  const session: { user: UserSession } = await getSession(context)

  if (!session || !session.user) {
    return { props: {} }
  }

  const props: any = { session }
  const { db } = await connectToDB()
  const folders = await folder.getFolders(db, session.user.id)
  props.folders = folders

  if (context.params.id) {
    const activeFolder = folders.find((f) => f._id === context.params.id[0])
    const activeDocs = await doc.getDocsByFolder(db, activeFolder._id)
    props.activeFolder = activeFolder
    props.activeDocs = activeDocs

    const activeDocId = context.params.id[1]

    if (activeDocId) {
      props.activeDoc = await doc.getOneDoc(db, activeDocId)
    }
  }

  return {
    props,
  }
}

export default App
