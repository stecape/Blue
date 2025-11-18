import { useContext, useRef } from "react"
import {
  Layout,
  LayoutAppBar,
  useLayoutNavigation,
  useCrossFadeTransition,
  useIsomorphicLayoutEffect
} from "react-md"
import {
  AppBarTitle,
  APP_BAR_OFFSET_CLASSNAME
} from "@react-md/app-bar"
import { PhonelinkEraseFontIcon } from "@react-md/material-icons"
import { StayPrimaryPortraitFontIcon } from "@react-md/material-icons"
import { CloudOffFontIcon } from "@react-md/material-icons"
import { CloudQueueFontIcon } from "@react-md/material-icons"
import { WifiTetheringFontIcon } from "@react-md/material-icons"
import { SignalWifiOffFontIcon } from "@react-md/material-icons"
import { ExitToAppFontIcon } from "@react-md/material-icons"
import { useLocation, Link } from "react-router-dom"
import { ctxData } from "./Helpers/CtxProvider"
import { useAuth } from "../Auth/AuthContext"
import navItems from "./navItems"

import './styles/Layout.scss'

import Content from "./Content"
const appBar = (pathname, backendConnected, dbConnected, mqttConnected, user, logout) => {
  return (
    <LayoutAppBar theme="primary">
      <AppBarTitle
        className="rmd-typography--capitalize"
      >
        <>Amarillo - {pathname.replace("/", "").toUpperCase()}</>
      </AppBarTitle>

      {user && (
        <span className="user-info" title={user.email}>
          {user.name}
        </span>
      )}

      {mqttConnected ? <WifiTetheringFontIcon className="icon-black" /> : <SignalWifiOffFontIcon className="icon-black" />}
      {dbConnected ? <StayPrimaryPortraitFontIcon className="icon-black" /> : <PhonelinkEraseFontIcon className="icon-black" />}
      {backendConnected ? <CloudQueueFontIcon className="icon-black" /> : <CloudOffFontIcon className="icon-black" />}
      
      {user && (
        <ExitToAppFontIcon 
          className="icon-black logout-icon" 
          onClick={logout}
          title="Logout"
          style={{ cursor: 'pointer', marginLeft: '12px' }}
        />
      )}
    </LayoutAppBar>
  )
}

export default function MyLayout() {
  const ctx = useContext(ctxData)
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const prevPathname = useRef(pathname)
  const { elementProps, transitionTo } = useCrossFadeTransition()
  
  // Chiamare sempre gli hooks in modo non condizionale
  const treeProps = useLayoutNavigation(navItems, pathname, Link)
  
  useIsomorphicLayoutEffect(() => {
    if (pathname === prevPathname.current) {
      return
    }

    prevPathname.current = pathname
    transitionTo('enter')
  }, [pathname, transitionTo])

  return (
    <Layout
      appBar={appBar(pathname, ctx.backendStatus.backendConnected, ctx.backendStatus.dbConnected, ctx.backendStatus.mqttConnected, user, logout)}
      navHeaderTitle="Menu"
      treeProps={treeProps}
      mainProps={elementProps}
    >
      <div className={APP_BAR_OFFSET_CLASSNAME}>
        <Content />
      </div>
    </Layout>
  )
}