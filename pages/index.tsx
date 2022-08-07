import { GetStaticProps } from 'next'
import type { NextPage } from 'next'
import Head from 'next/head'
import fs from 'fs'
import React, { useEffect, useState } from 'react'
// @ts-ignore
import icons from 'https://cdn.jsdelivr.net/npm/@exuanbo/file-icons-js@latest/dist/js/file-icons.esm.min.js'



type fileData = {
  [key: string]: Json
}

type Json = 
  | string
  | number
  | boolean
  | null
  | { [property: string]: Json }
  | Json[]

export const getStaticProps: GetStaticProps = async (context) => {
  let filenames: string[] = []
  const dir = './public/data/'
  const files = fs.readdirSync(dir)
  files.map(filename => {
    const file_ext = filename.split('.')
    if (file_ext.length > 1 && file_ext[file_ext.length - 1].toLowerCase() === 'json') {
      filenames.push(filename)
    }
  })
  return {
    props: {
      filenames
    }
  }
}

type JsonFile = {
  name: string,
  filepaths: string[]
} | null

const pathsToTree = (filepaths: string[]) => {
  let tree = filepaths.reduce(function(ancestry, filepath) {
    let element: any = ancestry
    const segments: string[] = filepath.split('/')
    for (const segment of segments) {
      if(!element[segment]) {
        element[segment] = {}
      }
      element = element[segment]
    }
    return ancestry
  }, {})
  return tree
}

const Tree = ({ name, items, open }: any ) => {
  const [isOpen, setOpen] = useState(open)
  const list = Object.keys(items)
  const icon = icons.getClass(name)
  if (list.length) {
    return (
      <>
        <li
          className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer p-1"
          onClick={() => setOpen(!isOpen)}
        >
          <i className={`${icon} mr-1`}/>
          {name}
        </li>
        <ul className="pl-5">
          {isOpen && list.map((item: any, i: number) => <Tree key={i} items={items[item]} name={item} /> )}
        </ul>
      </>
    )
  } else {
    return (
      <>
        <li className="font-light text-gray-700 dark:text-gray-300 p-1 leaning-loose"><i className={`${icon} mr-1`}/>{name}</li>
      </>
    )
  }
}

const Home: NextPage = ({ filenames }: any) => {

  const [loading, setLoading] = useState<boolean>(false)
  const [file, setFile] = useState<string>('')
  const [jsonfile, setJsonFile] = useState<JsonFile>(null)
  const [tree, setTree] = useState<any>(null)

  useEffect(() => {
    if (jsonfile) {
      const jsonfiletree = pathsToTree(jsonfile.filepaths)
      setTree(jsonfiletree)
    }
  }, [jsonfile])

  const setFileloadJsonFile = (filename: string) => {
    setFile(filename)
    try {
      setLoading(true)
      fetch(`/data/${filename}`)
        .then((response) => response.json())
        .then((data) => {
          setLoading(false)
          setJsonFile(data)
        })
        .catch((error) => {
          alert(error)
          setFile('')
          setLoading(false)
        })
    } catch (error) {
      alert(error)
      setFile('')
      setLoading(false)
    }
  }



  return (
    <div className="container mx-auto">
      <Head>
        <title>File browser</title>
        <meta name="description" content="File browser app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!loading && (

        <main className="p-10 min-h-[90vh]">
          <h1 className="text-xl my-20">File browser</h1>

          {filenames && (
            <>
              <label
                className="block p-1 mb-2"
                htmlFor="files"
              >
                Files
              </label>
              <select
                className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-1"
                id="files"
                value={file}
                onChange={(e) => (e.target.value ? setFileloadJsonFile(e.target.value) : null)}
              >
                <option value="">Select file...</option>
                {filenames.map((filename: string, index: number) => (
                  <option key={`file-${index}`} value={filename}>{filename}</option>
                ))}
              </select>
            </>
          )}

          {tree && (
            <ul className="text-lg">
              <Tree items={tree} name="" open={true} />
            </ul>
          )}

        </main>

      )}



      {loading && (
        <main className="grid content-center w-full h-[90vh] cursor-wait">
          <svg role="status"
            className="w-64 h-64 mx-auto text-main-body animate-spin fill-gray-500"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </main>
      )}

      <footer className="text-sm text-gray-500">
        <code>https://github.com/AMTemp/stz</code>
      </footer>

    </div>
  )
}

export default Home
