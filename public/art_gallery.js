const _ = window._;
const React = window.React;
const ReactDOM = window.ReactDOM;
const Griddle = window.Griddle;

const customColumnProps = {
    data: React.PropTypes.object.required,
    rowData: React.PropTypes.object.required,
    metadata: React.PropTypes.object.required,
};

const CheckboxColumn  = React.createClass({
    propTypes: customColumnProps,
    render() {
        const columnName = this.props.metadata.columnName;
        const columnValue = this.props.rowData[columnName];
        if (columnValue) {
            return <div>YES</div>;
        } else {
            return <div />;
        }
    },
});

const AttachmentsColumn = React.createClass({
    propTypes: customColumnProps,
    render() {
        const columnName = this.props.metadata.columnName;
        const attachments = this.props.rowData[columnName];
        const attachmentImages = _.map(attachments, attachment => {
            return <img className="artworkPreview" key={attachment.id} src={attachment.url} />;
        });
        return <div>{attachmentImages}</div>;
    },
});

const ArtGallery = React.createClass({
    propTypes: {
        services: React.PropTypes.array,
        updateOnDisplay: React.PropTypes.func,
    },
    _toggleOnDisplay(gridRow, event) {
        const serviceId = gridRow.props.data.service_id;
        this.props.updateOnDisplay(serviceId, !gridRow.props.data.on_display);
    },
    _renderArtistsIfLoaded() {
        if (this.props.services) {
            const columnMetadata = [
                {
                    columnName: "name",
                    displayName: "Service Name",
                    cssClassName: "serviceNameColumn",
                    visible: true,
                    order: 0,
                },
                {
                    columnName: "location",
                    displayName: "Location",
                    customComponent: CheckboxColumn,
                    cssClassName: "onDisplayColumn",
                    visible: true,
                    order: 1,
                },
                {
                    columnName: "service_id",
                    displayName: "id",
                    visible: false,
                    order: 3,
                },
            ];
            // Only need the columns due to a bug in griddle https://github.com/GriddleGriddle/Griddle/issues/114
            const columns = ["name", "location"];
            return <Griddle onRowClick={this._toggleOnDisplay} results={this.props.services} showFilter={true} showSettings={true} columnMetadata={columnMetadata} columns={columns} resultsPerPage={10} />;
        } else {
            return <div> Loading </div>;
        }
    },
    render() {
        return (
            <ReactBootstrap.Panel>
                <h1>Available Services</h1>
                <ReactBootstrap.Grid fluid={true}>
                    <ReactBootstrap.Row className="show-grid">
                        <ReactBootstrap.Col xs={0} md={0} lg={2}>
                        </ReactBootstrap.Col>
                        <ReactBootstrap.Col xs={12} md={12} lg={8}>
                            {this._renderArtistsIfLoaded()}
                        </ReactBootstrap.Col>
                    </ReactBootstrap.Row>
                </ReactBootstrap.Grid>
            </ReactBootstrap.Panel>
        );
    },
});

const ArtGalleryApp = React.createClass({
    propTypes: {
        // No props here
    },
    getInitialState() {
        return {
            services: null,
        };
    },
    componentDidMount() {
        this._loadArtists();
    },
    _loadArtists() {
        $.ajax('/v0/services').then((response, status, jqXHR) => {
            console.log(response);
            this.setState({
                services: response.services,
            });
        });
    },
    _updateOnDisplay(serviceId, isOnDisplay) {
        $.ajax('/v0/set_on_display', {
            method: 'POST',
            data: {
                artist_id: artistId,
                on_display: isOnDisplay,
            },
        }).then((response, status, jqXHR) => {
            const updatedArtists = response.services;
            const newArtists = _.map(this.state.services, service => {
                if (service.service_id === serviceId) {
                    return _.extend({}, service, updatedArtists);
                } else {
                    return service;
                }
            });
            this.setState({
                services: newArtists,
            });
        });
    },
    render() {
        return (
            <ArtGallery services={this.state.services} updateOnDisplay={this._updateOnDisplay}/>
        );
    },
});

var rootNode = document.getElementById('appRoot');
ReactDOM.render(<ArtGalleryApp/>, rootNode);
