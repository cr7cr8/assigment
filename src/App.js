import logo from './logo.svg';
import './App.css';
import axios from "axios"
import { setupCache } from 'axios-cache-adapter'

import React, { useState } from 'react';


import { JSONTree } from 'react-json-tree';


const cache = setupCache({
  maxAge: 15 * 60 * 1000
})

const api = axios.create({
  adapter: cache.adapter
})


const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

 

const jsonTreePorp = {
  shouldExpandNode: (keyPath, data, level) => false,
  hideRoot: true,
  theme: theme,
  invertTheme: true,
  isCustomNode: value => false,
  getItemString: (type, data, itemType, itemString, keyPath) => <></>,
  labelRenderer: ([key], nodeType, expanded, expandable) => <strong>{key}</strong>,

}

 
function App() {

  const [json, setJson] = useState({})

  const [url, setUrl] = useState("facebook/react")
  const [token, setToken] = useState("")

  const [disableBtn, setDisableBtn] = useState(false)

  const [errMessage, setErrMessage] = useState("")

  const fetchJson = () => {

    setDisableBtn(true)
    errMessage && setErrMessage("")
    setJson({})

    api.get("https://api.github.com/repos/" + url,
      { headers: { 'Authorization': token } }
    ).then(response => {
      setDisableBtn(false)
      setJson(response.data)
    }).catch(err => {
      setDisableBtn(false)

      setErrMessage(err.message)
    })

  }



  return (
    <>


      <table style={{ marginLeft: "100px", marginTop: "30px" }}>

        <tbody>
          <tr>
            <td>
              <span>https://api.github.com/repos/</span>
            </td>
            <td>
              <input type="text" value={url} disabled={disableBtn}
                onKeyUp={function (e) {
                  if (e.key === 'Enter' || e.keyCode === 13) {
                    fetchJson()
                  }
                }}
                onChange={function (e) {
                  errMessage && setErrMessage("")
                  setUrl(e.target.value)
                }} />
            </td>
            <td><button disabled={disableBtn} onClick={fetchJson}>{disableBtn ? "Loading" : "Fetch"}</button></td>
          </tr>
          <tr>

            <td style={{ textAlign: "right" }}>
              <span>github token</span>
            </td>
            <td>
              <input type="text" value={token} onChange={function (e) {
                setToken(e.target.value)
              }} />
            </td>
          </tr>
        </tbody>

      </table>

      {errMessage
        ? <div style={{ marginLeft: "100px" }}>
          {errMessage}
        </div>
        : <div style={{ marginLeft: "100px" }}>
          <JSONTree
            data={json}
            {...jsonTreePorp}
            valueRenderer={function (value) {
              return (String(value).indexOf("https://api.github.com") >= 0 && String(value).indexOf("{") < 0)
                ? <> <em>{value}</em> <ExpandableValue value={value} token={token} />  </>
                : <em>{value}</em>
            }}

          />
        </div>


      }

    </>

  )
}

export default App;



function ExpandableValue({ value, token, ...props }) {

  const [json, setJson] = useState()
  const [btnText, setBtnText] = useState("Fetch")

  const onClick = () => {
    setBtnText("fetching...")
    api.get(value.replaceAll("\"", ""),
      {
        headers: { 'Authorization': token }
      }
    ).then(response => {
      setJson(response.data)
    })
      .catch(err => {
        setBtnText("Bad link")
      })
  }


  if (!json) {
    return <button
      disabled={btnText !== "Fetch"}
      onClick={onClick}
      style={{ ...btnText === "Bad link" && { color: "red" } }}
    >{btnText}</button>

  }

  if (Array.isArray(json) && json.length === 0) { return <span>[&nbsp;]</span> }

  return (
    <div style={{ backgroundColor: "pink" }}>
      <JSONTree

        data={json}
        {...jsonTreePorp}
        labelRenderer={function ([key], nodeType, expanded, expandable) {
         

          return expandable
          ? <strong style={{
            ...isInDesiredForm(key) && {
              color: "pink",
            },
          }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{key}</strong>
          :<strong>{key}</strong>

     
        }}
        valueRenderer={function (value) {
          return (String(value).indexOf("https://api.github.com") >= 0 && String(value).indexOf("{") < 0)
            ? <> <em>{value}</em> <ExpandableValue value={value} token={token} />  </>
            : <em>{value}</em>
        }}

      />
    </div >
  )


}
function isInDesiredForm(str) {
  return /^\+?(0|[1-9]\d*)$/.test(str);
}