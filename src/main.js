import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import {DataSelectMachine} from './js/DataModules/DataSelectMach.js'
import M from 'materialize-css';
// import {QueriesSelectMachine} from './js/QueriesModules/QueriesSelectMach.js'
import {Card, Button} from 'react-materialize'
import {ParseData} from './js/DataModules/DataPage.js'
import {SensorsInfo} from './js/QueriesModules/QueriesPage.js'
import $ from 'jquery';

export class MainPage extends React.Component {
	constructor(props){
		super(props);
		this.state = {

		};
	}

    componentDidMount(){
        $('.button-collapse').sideNav({
          menuWidth: 300, // Default is 300
          edge: 'left', // Choose the horizontal origin
          closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true, // Choose whether you can drag to open on touch screens,
      });
    }

    // showSideNav(){
    //     $('.button-collapse').sideNav('show');
    // }

	render(){


		return(
            <nav>
                <div className="nav-wrapper">
    					<a href="#" className="brand-logo center">Análisis de datos de sensores</a>
    					<ul className="left">
    						<li>
								<Button data-activates="slide-out" className="button-collapse show-on-medium-and-up btn-flat white-text btn-floating">
									<i className="material-icons">menu</i>
								</Button>
                                {/* <a href="#" data-activates="slide-out" className="button-collapse show-on-medium-and-up">
                                    <i className="material-icons">menu</i>
                                </a> */}
    						</li>
    					</ul>
    				</div>

                <ul id="slide-out" className="side-nav">
                    <li>
                        <div className="user-view">
                            <a href="#!name">
                                <span className="white-text name">John Doe</span>
                            </a>
                            <a href="#!email">
                                <span className="white-text email">jdandturk@gmail.com</span>
                            </a>
                        </div>
                    </li>
                    <li>
                        <a href="#!">
                            <i className="material-icons">cloud</i>
                            First Link With Icon
                        </a>
                    </li>
                    <li>
                        <a href="#!">Second Link</a>
                    </li>
                    <li>
                        <div className="divider"></div>
                    </li>
                    <li>
                        <a className="subheader">Subheader</a>
                    </li>
                    <li>
                        <a className="waves-effect" href="#!">Third Link With Waves</a>
                    </li>
                 </ul>
            </nav>
		)
	}
}

// ReactDOM.render(
// 	<MainPage />,
//   	document.getElementById('root')
// );
