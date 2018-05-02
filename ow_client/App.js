/**
 * Main OurWater App
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ScrollView,
  Text,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import firebase from 'react-native-firebase';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import SearchBar from './components/SearchBar';
import LoadLocationButton from './components/LoadLocationButton';
import IconButton from './components/IconButton';
import Loading from './components/Loading';
import ResourceDetailSection from './components/ResourceDetailSection';
import ResoureMarker from './components/common/ResourceMarker';

import FirebaseApi from './api/FirebaseApi';
import { 
  formatCoords, 
  pinColorForResourceType,
  getLocation,
  getSelectedResourceFromCoords,
} from './utils';

import {
  MapHeightOptions, 
  MapStateOptions,
  ResourceTypes
} from './enums';

import Config from 'react-native-config'
const orgId = Config.REACT_APP_ORG_ID;

type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props);
    this.fs = firebase.firestore();

    this.state = {
      loading: true,
      region: {
        latitude: 23.345,
        longitude: 23.44,
        latitudeDelta: 0.5,
        longitudeDelta: 0.25,
      },
      userRegion: {
        latitude: 23.345,
        longitude: 23.44,
        latitudeDelta: 0.5,
        longitudeDelta: 0.25,
      },
      droppedPin: false,
      droppedPinCoords: {},
      hasSavedReadings: false,
      
      mapHeight: MapHeightOptions.default,
      mapState: MapStateOptions.default,

      hasSelectedResource: false,
      selectedResource: {},

      isAuthenticated: false,
      userId: ''
    };
  }

  componentWillMount() {
    let { region } = this.state;

    this.setState({loading: true});

    FirebaseApi.signIn()
    .then(siginData => {
      this.setState({ 
        isAuthenticated: true,
        userId: siginData._user.uid,
      });
      return getLocation();
    })
    .catch(err => {
      console.log("error signing in", err);
      this.setState({ isAuthenticated: false });
      return getLocation();
    })
    .then(location => {
      this.updateGeoLocation(location);
      return FirebaseApi.getResourceNearLocation({orgId, ...location.coords, distance: 0.1});
    })
    .then(resources => {
      console.log('resources', resources);
      this.setState({
        loading: false,
        resources
      });
    })
    .catch(err => {
      console.log(err);
    });
  }

  onMapPressed({coordinate}) {
    const { mapState } = this.state;

    //Don't drop a marker if the map is in small mode, 
    //just make the map bigger, and deselect the resource
    if (mapState === MapStateOptions.small) {
      this.setState({
        mapState: MapStateOptions.default,
        mapHeight: MapHeightOptions.default,
        selectedResource: {},
        hasSelectedResource: false,
      });

      return;
    }

    this.setState({
      droppedPin: true,
      droppedPinCoords: coordinate,
    });

    //TODO: reload the resources based on pin drop + zoom level
  }

  getDroppedPin() {
    const { droppedPin, droppedPinCoords } = this.state;

    if (!droppedPin) {
      return false;
    }

    return (
      <Marker
        key='droppedPin'
        coordinate={droppedPinCoords}
        title='Your Pin'
        image={require('./assets/my_pin.png')}
      />
    );
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  imageForResourceType(type) {
    switch (type) {
      case ResourceTypes.checkdam:
        return require('./assets/checkdam_pin.png');
      case ResourceTypes.raingauge:
        return require('./assets/raingauge_pin.png');
      case ResourceTypes.well:
        return require('./assets/well_pin.png');
      case ResourceTypes.custom:
        return require('./assets/other_pin.png')
    }
  }

  /**
   * When user clicks on a resource, make the map small, 
   * scroll to the top of the view, and display the resource details
   * 
   * @param {*} param0 
   */
  focusResource({coordinate, position}) {
    const resource = getSelectedResourceFromCoords(this.state.resources, coordinate);

    this.setState({
      mapHeight: MapHeightOptions.small,
      mapState: MapStateOptions.small,
      hasSelectedResource: true,
      resource
    });

    //Do in the background - we don't care when
    //TODO: we need to set up a watch on this path, to get updates etc.
    FirebaseApi.addRecentResource({orgId, resourceId: resource.id, userId: this.state.userId});
  }

  getMap() {
    const { userRegion, region, loading, resources, mapHeight } = this.state;

    console.log('region:', region);

    return (
      <View style={{
        backgroundColor: 'blue',
      }}>
        <MapView
          style={{
            position: 'relative',
            width: '100%',
            height: mapHeight
          }}
          onPress={e => this.onMapPressed(e.nativeEvent)}
          region={region}
          onRegionChangeComplete={(region) => this.onRegionChange(region)}
        >
          <Marker
            key='geoLocation'
            coordinate={{ latitude: userRegion.latitude, longitude: userRegion.longitude}}
            title='Me'
            image={require('./assets/my_location.png')}
          />
          {this.getDroppedPin()}
          {resources.map(resource => (
            <Marker
              key={resource.id}
              coordinate={formatCoords(resource.coords)}
              title={resource.id}
              description={resource.type}
              image={this.imageForResourceType(resource.type)}
              onPress={(e) => this.focusResource(e.nativeEvent)}
            />
          ))}
        </MapView>
        <View style={{
          position: 'absolute',
          width: '100%',
          height: 50,
          top: '0%',
          left: '0%',
        }}>
        {this.getSearchBar()}
        </View>

        <View style={{
          position: 'absolute',
          width: '100%',
          height: 40,
          bottom: '5%',
          left: '0%',
        }}>
          {this.getMapButtons()}
          {this.getUpButton()}
        </View>

      </View>
    );
  }

  getSearchBar() {
    const { mapState } = this.state;

    //Hide this when the map is small
    if (mapState === MapStateOptions.small) {
      return null;
    }

    return (
      <SearchBar
        onEndEditing={(text) => console.log("TODO: search, ", text)}
      />
    );
  }

  updateGeoLocation(location) {
    let region = {...this.state.region};
    let userRegion = { ...this.state.userRegion};
    
    //Move the pin to the user's location, 
    //and move the map back to where the user is
    //TODO: chang the zoom level?
    region.latitude = location.coords.latitude;
    region.longitude = location.coords.longitude;
    userRegion.latitude = location.coords.latitude;
    userRegion.longitude = location.coords.longitude;

    console.log("updating geolocation", region, userRegion);
    
    this.setState({
      region,
      userRegion,
    });
  }

  //Don't know if this will work...
  //TODO: figure out how to animate?
  toggleFullscreenMap() {
    const { mapHeight, mapState } = this.state;

    let newMapState = MapStateOptions.default;
    let newMapHeight = MapHeightOptions.default;
    
    if (mapState === MapStateOptions.default) {
      newMapState = MapStateOptions.fullscreen;
      newMapHeight = MapHeightOptions.fullscreen;
    }

    this.setState({
      mapState: newMapState,
      mapHeight: newMapHeight,
    });
  }

  clearDroppedPin() {

    this.setState({
      droppedPin: false,
      droppedPinCoords: {},
    });

    //TODO: should we re-do the search for the user?
  }

  clearSelectedResource() {

    this.setState({
      mapState: MapStateOptions.default,
      mapHeight:MapHeightOptions.default,
      hasSelectedResource: false,
      selectedResource: {},
    });
  }

  getMapButtons() {
    const { mapHeight, mapState } = this.state;

    //Hide these buttons when the map is in small mode
    if (mapState === MapStateOptions.small) {
      //TODO: fade out nicely
      return null;
    }

    let fullscreenIcon = 'fullscreen';
    if (mapState === MapStateOptions.fullscreen) {
      fullscreenIcon = 'fullscreen-exit';
    }

    return (
      <View style={{
        flexDirection:'row',
        justifyContent:'space-around',
      }}>
        <LoadLocationButton
          onComplete={location => this.updateGeoLocation(location)}
        />
        <IconButton 
          name={fullscreenIcon}
          onPress={() => this.toggleFullscreenMap()}
          color="#FF6767"
        />
        <IconButton 
          name="clear"
          onPress={() => this.clearDroppedPin()}
          color="#FF6767"
        />
      </View>
    );
  }

  getFavouritesList() {
    const { hasSelectedResource } = this.state;

    if(hasSelectedResource) {
      return null;
    }

    return (
      <View style={{
        backgroundColor: '#D9E3F0',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 5,
      }}>
        <Text>Recents</Text>
      </View>
    )
  }

  //A button for the user to deselect a resource, and exit out
  //of small map mode
  getUpButton() {
    const { hasSelectedResource, selectedResource } = this.state;

    if (!hasSelectedResource) {
      return null;
    }

    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
      }}>
      <IconButton
        name="clear"
        onPress={() => this.clearSelectedResource()}
        color="#FF6767"
      />
      </View>
    );
  }

  getResourceView() {
    const {hasSelectedResource, selectedResource} = this.state;

    if (!hasSelectedResource) {
      return null;
    }

    return (
      <View style={{
        backgroundColor: '#D9E3F0',
        //TODO: change this back at some stage
        // height:1000
      }}>
        <ResourceDetailSection
          resource={selectedResource}
          onMorePressed={() => console.log('onMorePressed')}
          onAddToFavourites={() => console.log('onAddToFavourites')}
          onRemoveFromFavourites={() => console.log('onRemoveFromFavourites')}
          onAddReadingPressed={() => console.log('onAddReadingPressed')}  
        />
      </View>
    );
  }

  getSavedReadingsButton() {
    const { hasSavedReadings } = this.state;

    if (!hasSavedReadings) {
      return null;
    }

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
        <Text>Saved Readings</Text>
      </View>
    );
  }
  
  render() {
    const { coords, loading, resources } = this.state;

    if (loading) {
      return (
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1
        }}>
          <Loading/>
        </View>
      );
    }

    return (
      <View style={{
        marginTop: 0,
        flex: 1
      }}>
        {this.getMap()}
        <ScrollView style={styles.container}>
          {this.getResourceView()}
          {this.getFavouritesList()}
          {this.getSavedReadingsButton()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1
  }
});