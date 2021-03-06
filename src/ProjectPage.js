import React from 'react'
import State from './State.js'
import Uumm from './UummContractInterface.js'
import RaisedButton from 'material-ui/RaisedButton'
import CreateProposalPage from './CreateProposalPage.js'
import ProposalsList from './ProposalsList.js'
import Web3AutoSetup from './Web3AutoSetup.js'
import {Tabs, Tab} from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import ProjectOverview from './ProjectOverview.js'
import Warning from './Warning.js'

const tabStyle=
{
    paddingTop:20
}

class ProjectDetails extends React.Component {

    constructor(props)
    {
        super()

        this.state = {"newProposalDialogIsOpen" : false, slideIndex: 0}

        Uumm.isReady().then(()=>{
            Uumm.getProjectDetails(props.projectId)
            Uumm.getContributors(props.projectId)
            Uumm.getProposals(props.projectId)
            Web3AutoSetup.addAccountChangedListener(this.onAddressChange)
        })

        window.location.hash = "projectId="+props.projectId
    }

    onAddressChange=()=>
    {
        Uumm.getUserContributorData(this.props.projectId, Web3AutoSetup.currentAccount)
    }

    handleChange = (value) => {
    this.setState(
    {
          slideIndex: value,
        })
    }

    onMakeNewProposal=()=>
    {
         this.setState({'newProposalDialogIsOpen':true})
    }

    onProposalSubmited=(title, reference, tokenAmount)=>
    {
        this.setState({'newProposalDialogIsOpen':false})
        Uumm.createProposal(this.props.projectId, title, reference, tokenAmount)
    }

    onProposalSelected=(proposalId)=>
    {
       console.log("ProposalClicked")
    }

    closeDialog = ()=>
    {
        this.setState({'newProposalDialogIsOpen':false})
    }

    render()
    {
        let projectData = State.getEmptyProject()
        let contributorData = State.getEmptyContributor()
    
        if(State.data.projects[this.props.projectId])
            projectData = State.data.projects[this.props.projectId]

        if(projectData.contributors)
               if(projectData.contributors[Web3AutoSetup.currentAccount])
                    contributorData = projectData.contributors[Web3AutoSetup.currentAccount]

        let noOwnershipWarning = <div/>

        if(!contributorData.valueTokens && Web3AutoSetup.getProviderInfo().canWrite)
        {
            noOwnershipWarning= <Warning>           
                <p>Your address doesn't own any shares of this project, therefore you can't vote.</p>
                <p>You can still make proposals though :)</p>         
            </Warning>
        }

        return (
            <div >             
                <h1> {projectData.name} </h1>

                <Tabs onChange={this.handleChange} value={this.state.slideIndex}>
                     <Tab label="Overview" value={0}/>
                     <Tab label="Proposals" value={1}/>
                </Tabs>

                <SwipeableViews index={this.state.slideIndex} onChangeIndex={this.handleChange}>

                    <div style={tabStyle}>
                        <ProjectOverview
                            projectId={this.props.projectId}
                            userAddress={this.props.userAddress}/>      
                    </div>

                    <div style={tabStyle}> 

                        {noOwnershipWarning}
                        
                        <RaisedButton
                            secondary={true}
                            fullWidth={false}
                            label="Make new proposal"
                            onTouchTap={this.onMakeNewProposal}
                            disabled={!Web3AutoSetup.getProviderInfo().canWrite}/> 

                        <CreateProposalPage
                            open={this.state.newProposalDialogIsOpen}
                            onCancel={this.closeDialog}
                            onCreate={this.onProposalSubmited}/>

                        <ProposalsList
                            projectId={this.props.projectId}
                            userAddress={this.props.userAddress}
                            onProposalSelected={this.onProposalSelected}/>
                    </div> 
                
                 </SwipeableViews>
                
            </div>
        )
    }
}

export default ProjectDetails