import * as React from 'react';

import { IRouter, Link } from 'react-router';
import { url } from '../../util';

import { IOwner } from '../../types';

interface IFindOwnersPageProps {
  location: HistoryModule.Location;
}

interface IFindOwnersPageState {
  owners?: IOwner[];
  filter?: string;
}

interface IRouterContext {
  router: IRouter;
}

const getFilterFromLocation = (location) => {
  return location.query ? (location.query as any).lastName : null;
};


export default class FindOwnersPage extends React.Component<IFindOwnersPageProps, IFindOwnersPageState> {
  context: IRouterContext;

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.submitSearchForm = this.submitSearchForm.bind(this);

    this.state = {
      filter: getFilterFromLocation(props.location)
    };
  }

  componentDidMount() {
    const { filter } = this.state;
    if (typeof filter === 'string') {
      // only load data on mount (initialy) if filter is specified
      // i.e. lastName query param in uri was set
      this.fetchData(filter);
    }
  }

  componentWillReceiveProps(nextProps: IFindOwnersPageProps) {
    const { location } = nextProps;

    // read the filter from uri
    const filter = getFilterFromLocation(location);

    // set state
    this.setState({ filter });

    // load data according to filter
    this.fetchData(filter);
  }

  onFilterChange(event) {
    this.setState({
      filter: event.target.value as string
    });
  }

  /**
   * Invoked when the submit button was pressed.
   * 
   * This method updates the URL with the entered lastName. The change of the URL
   * leads to new properties and thus results in rerending
   */
  submitSearchForm() {
    const { filter } = this.state;

    this.context.router.push({
      pathname: '/owners/list',
      query: { 'lastName': filter || '' }
    });
  }

  /** 
   * Actually loads data from the server
   */
  fetchData(filter: string) {
    const query = filter ? encodeURIComponent(filter) : '';
    const requestUrl = url('api/owner/list?lastName=' + query);

    fetch(requestUrl)
      .then(response => response.json())
      .then(owners => { console.log('owners', owners); this.setState({ owners }); });
  }

  renderOwners(owners: IOwner[]) {
    if (!owners) {
      return null;
    }

    if (owners.length === 0) {
      return <h2>No owners found</h2>;
    }

    function renderRow(owner: IOwner) {
      return <tr key={owner.id}>
         <td>
            <a href={'/owners/' + owner.id}>
                {owner.firstName} {owner.lastName}
            </a>
        </td>
        <td className='hidden-sm hidden-xs'>{owner.address}</td>
        <td>{owner.city}</td>
        <td>{owner.telephone}</td>
        <td className='hidden-xs'>{owner.pets.map(pet => pet.name).join(', ')}</td>
      </tr>;
    }

    return (
      <div>
        <h2>{owners.length} Owners found</h2>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>Name</th>
              <th className='hidden-sm hidden-xs'>Address</th>
              <th>City</th>
              <th>Telephone</th>
              <th className='hidden-xs'>Pets</th>
            </tr>
          </thead>
          <tbody>
            {owners.map(renderRow)}
          </tbody>
        </table>

      </div>
    );
  }

  render() {
    const { filter, owners } = this.state;

    return (
      <span>
        <h2>Find Owners</h2>

        <form className='form-horizontal' action='javascript:void(0)'>
          <div className='form-group'>
            <div className='control-group' id='lastName'>
              <label className='col-sm-2 control-label'>Last name </label>
              <div className='col-sm-10'>
                <input className='form-control' name='filter' value={filter || ''} onChange={this.onFilterChange} size={30} maxLength={80} />
                { /* <span className='help-inline'><form:errors path='*'/></span> TODO */}
              </div>
            </div>
          </div>
          <div className='form-group'>
            <div className='col-sm-offset-2 col-sm-10'>
              <button type='button' onClick={this.submitSearchForm} className='btn btn-default'>Find Owner</button>
            </div>
          </div>
        </form>
        <br />
        {this.renderOwners(owners)}
        <br />
        <Link className='btn btn-default' to='/api/owners/new'> Add Owner</Link>
      </span>
    );
  }
};

