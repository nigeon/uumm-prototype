import React, { Component } from 'react'
import 'material-ui'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import InjectTapEventPlugin from 'react-tap-event-plugin'
import ProjectsListPage from './ProjectsListPage.js'
import ProjectPage from './ProjectPage.js'
import State from './State.js'
import NetworkState from './NetworkState.js'
import QueryString from 'query-string';
import Web3AutoSetup from './Web3AutoSetup.js'
import Uumm from './UummContractInterface.js'
import GreyTheme from './GreyTheme.js'
import './index.css'

InjectTapEventPlugin()

const PROJECTS_LIST="ProjectsList"
const PROJECT_PAGE="ProjectPage"

class App extends Component
{
    constructor(props)
    {
        super(props) 

        this.state ={
            'currentPage':PROJECTS_LIST,
            'currentProjectId':0,
            'userAddress' : Web3AutoSetup.currentAccount,
            'canWrite':false
        }

        Uumm.isReady().then(()=>{
            this.onAddressChange(Web3AutoSetup.currentAccount)  
        })

        Web3AutoSetup.addAccountChangedListener(this.onAddressChange)
        State.addListener(this.onStateUpdated)
    }

    onAddressChange=(newAddress)=>
    {
        var canWrite = false

        if(Web3AutoSetup.isConnected() && newAddress)
            canWrite = true

        this.setState({
                'userAddress' : newAddress,
                'canWrite':canWrite
            })
    }

    componentWillMount=()=>
    {
        window.addEventListener('hashchange', this.onHashChanged, false);
        this.onHashChanged()
    }

    onStateUpdated=()=>
    {
        this.forceUpdate();
    }

    onHashChanged=()=>
    {
        const parsedHash = QueryString.parse(location.hash)
        this.route(parsedHash)
    }

    route=(params)=>
    {
        //TODO: validate string
        if(params.projectId)
        {
            this.setState({
                'currentPage':PROJECT_PAGE,
                'currentProjectId':params.projectId
                })
        }
        else
        {
            this.setState({
                 'currentPage':this.PROJECT_LIST,
            })
        }
    }

    onProjectSelected = (projectData)=>
    {
        this.setState({
            'currentPage':PROJECT_PAGE,
            'currentProjectId':projectData.id
        })
    }

    getCurrentPage = () =>
    {
         switch (this.state.currentPage)
         {
            case PROJECTS_LIST:
                return  <ProjectsListPage
                    onProjectSelected={this.onProjectSelected}
                    userAddress={this.state.userAddress}
                    canWrite={this.state.canWrite}/>
            case PROJECT_PAGE:
                return  <ProjectPage
                    projectId={this.state.currentProjectId}
                    userAddress={this.state.userAddress}
                    canWrite={this.state.canWrite}/>
            default :
                return <ProjectsListPage
                    onProjectSelected={this.onProjectSelected}
                    userAddress={this.state.userAddress}
                    canWrite={this.state.canWrite}/>
        }
    }

    render(){

        var page=this.getCurrentPage();
        return (
            <div className="App">
                <MuiThemeProvider muiTheme={GreyTheme}>
                    <div>
                        <NetworkState/>

                        <div style={{
                                display:"flex",
                                justifyContent:"center",
                                alignItems:"flexStart"
                            }}>
                            <div style={{margin:20, maxWidth:600, minWidth:400}}>
                                {page}                              
                            </div>
                        </div>
                    </div>
                </MuiThemeProvider>
            </div>
        )
    }
}

export default App
