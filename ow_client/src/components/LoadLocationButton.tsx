import * as React from 'react'; import { Component } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';

import {
  getLocation,
} from '../utils';
import { textDark, primary } from '../utils/Colors';
import * as appActions from '../actions/index';
import { AppState } from '../reducers';
import { connect } from 'react-redux'
import { NoLocation } from '../typings/Location';
import { SyncMeta } from '../AppProvider';
import { SomeResult, ResultType } from '../typings/AppProviderTypes';

export interface Props { 
  onComplete: any,
  location: Location | NoLocation,
  locationMeta: SyncMeta,
  getGeoLocation: () => SomeResult<Location>,
}

export interface State {
}

class LoadLocationButton extends Component<Props> {

  constructor(props: Props) {
    super(props);

  }

  async updateGeoLocation() {
    console.log("HELLO");
    const result = await this.props.getGeoLocation();

    //TODO: this is less than ideal
    if (result.type === ResultType.SUCCESS) {
      this.props.onComplete(result.result);
    }
  }

  render() {
    const { locationMeta: { loading } } = this.props;

    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: primary,
        borderRadius: 50,
        width:45,
        height:45,
      }}>
        {loading ? 
          <ActivityIndicator 
            size="large" 
            color={textDark}
            />:
          <Icon 
            reverse
            raised
            size={20}
            name={"near-me"}
            onPress={() => this.updateGeoLocation()}
            iconStyle={{
              color: textDark,
            }}
            color={primary}
          />
        }
      </View>
    );
  }
}



//If we don't have a user id, we should load a different app I think.
const mapStateToProps = (state: AppState) => {
  return {
    location: state.location,
    locationMeta: state.locationMeta,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    getGeoLocation: () => dispatch(appActions.getGeolocation())
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(LoadLocationButton);