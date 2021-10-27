import React, { Component } from "react";
import classNames from 'classnames';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { Dialog } from 'primereact/dialog';
import 'primeicons/primeicons.css';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      movies: null,
      selectedMovies: null,
      selectedDirectors: [],
      selectedCertifications: [],
      directors: [],
      displayOverview: false,
      overviewPosition: 'right',
      overviewPlot: '',
      overviewCast: [],
      overviewGenre: [],
      overviewTitle: '',
      overviewSubtitle: '',

    };

  }
  componentDidMount() {
    fetch('https://skyit-coding-challenge.herokuapp.com/movies')
      .then((response) => response.json())
      .then((data) => {
        var directors = new Set()
        var certifications = new Set()
        data.forEach(element => {
          element.ratingPercent = (Math.ceil(element.rating * 10000 / 5)) / 100
          directors.add(element.director)
          certifications.add(element.certification)
        });

        this.setState({ movies: data })
        this.setState({ directors: Array.from(directors) })
        this.setState({ certifications: Array.from(certifications) })
        console.log(this.state)
      })
    this.onDirectorFilterChange = this.onDirectorFilterChange.bind(this);
    this.onCertificationsFilterChange = this.onCertificationsFilterChange.bind(this);
    this.showDetails = this.showDetails.bind(this)
    this.getOverviewHeader = this.getOverviewHeader.bind(this)
  }

  directorItemTemplate(option) {

    return (
      <div className="p-multiselect-director-option">
        <span style={{ verticalAlign: 'middle', marginLeft: '.5em' }}>{option}</span>
      </div>
    );
  }
  onDirectorFilterChange(event) {
    this.dt.filter(event.value, 'director', 'in');
    this.setState({ selectedDirectors: event.value });
  }
  renderDirectorFilter() {
    return (
      // null
      // <MultiSelect className="p-column-filter" value={this.state.selectedDirectors} options={this.state.directors}/>
      <MultiSelect className="p-column-filter" value={this.state.selectedDirectors} options={this.state.directors}
        onChange={this.onDirectorFilterChange} placeholder="All" />
    );
  }

  renderCertificationsFilter() {
    return (
      <Dropdown value={this.state.selectedCertifications} options={this.state.certifications} onChange={this.onCertificationsFilterChange}
        itemTemplate={this.certificateItemTemplate} showClear placeholder="Select a Certificate" className="p-column-filter" />
    );
  }

  certificateItemTemplate(option) {
    return (
      <span className={classNames('certificate', 'certificate-' + option.toLowerCase().replace(' ', "-"))}>{option}</span>
    );
  }

  onCertificationsFilterChange(event) {
    this.dt.filter(event.value, 'certification', 'equals');
    this.setState({ selectedCertifications: event.value });
  }
  certificateBodyTemplate(rowData) {
    return (
      <React.Fragment>
        <span className={classNames('certificate', 'certificate-' + rowData.certification.toLowerCase().replace(' ', "-"))}>{rowData.certification}</span>
      </React.Fragment>
    );
  }
  showDetails(event) {

    this.setState({ displayOverview: !this.state.displayOverview })
    this.setState({ overviewTitle: event.data.title })
    this.setState({ overviewSubtitle: 'Directed by ' + event.data.director })
    this.setState({ overviewPlot: event.data.plot })
    this.setState({ overviewGenre: event.data.genre })
    this.setState({ overviewCast: event.data.cast })
    console.log(this.state)
  }
  getOverviewHeader() {
    return (
      <div>
        <h2>{this.state.overviewTitle}</h2>
        <h3>{this.state.overviewSubtitle}</h3>
      </div>
    )
  }
  render() {
    const directorFilter = this.renderDirectorFilter();
    const certificationsFilter = this.renderCertificationsFilter();
    return (
      <div>
        <h1 style={{ textAlign: "center" }}>Favourite Movie List</h1>
        <DataTable ref={(el) => this.dt = el} value={this.state.movies} onRowClick={this.showDetails}>
          <Column selectionMode="single" style={{ width: '3em' }} />
          <Column field="title" header="Title" sortable filter filterPlaceholder="Search by name" />
          <Column field="releaseDate" filterField="releaseDate" header="Year" filter filterMatchMode="contains" filterPlaceholder="Search by year" />
          <Column field="length" header="Length" filter filterMatchMode="contains" filterPlaceholder="Search by time" />
          <Column field="director" filterField="director" header="Director" filter filterElement={directorFilter} />
          <Column field="certification" body={this.certificateBodyTemplate} header="Certification" filter filterMatchMode="gte" filterPlaceholder="Minimum" filterElement={certificationsFilter} />
          <Column field="ratingPercent" header="Rating" filter filterMatchMode="gte" filterPlaceholder="Minimum" />
          <Column headerStyle={{ width: '8em', textAlign: 'center' }} bodyStyle={{ textAlign: 'center', overflow: 'visible' }} />
        </DataTable>
        <Dialog
          position={this.state.overviewPosition}
          header="Header"
          visible={this.state.displayOverview}
          style={{ width: '50vw' }}
          onHide={() => { this.setState({ 'displayOverview': false }) }}
          footer={"All movie data are from Wikipedia and IMDB."}
          header={"Movie Details"}>
          <div>
            {this.getOverviewHeader()}
          </div>
          <div className="overview-content">
            <div>
              <div className="badge-list">
                <p>Genre:</p>
                {
                  this.state.overviewGenre.map((elm, idx) => {
                    return (
                      <p key={idx} className='badge'>{elm}</p>
                    )
                  })
                }
              </div>
            </div>
            <div>
              <div className='badge-list'>
                <p>Cast:</p>
                {
                  this.state.overviewCast.map((elm, idx) => {
                    return (
                      <p key={idx} className='badge'>{elm}</p>
                    )
                  })
                }
              </div>
            </div>
            <div>
              <p>{this.state.overviewPlot}</p>
            </div>
          </div>

        </Dialog>
      </div>
    );
  }
}