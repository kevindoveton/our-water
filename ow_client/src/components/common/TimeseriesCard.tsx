import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
} from 'react-native-elements';
import { OWTimeseries, Reading, TimeseriesRange, TimeseriesRangeReadings, TimeseriesReadings } from '../../typings/models/OurWater';
import { View } from 'react-native';
import { primaryLight, primaryDark, bgLight, bgLightHighlight } from '../../utils/Colors';
import LineChartExample from './DemoChart';
import { SomeResult } from '../../typings/AppProviderTypes';
import Loading from './Loading';
import { ConfigFactory } from '../../config/ConfigFactory';
import BaseApi from '../../api/BaseApi';

import { AppState } from '../../reducers';
import * as appActions from '../../actions/index';
import { connect } from 'react-redux'
import { getTimeseriesReadingKey } from '../../utils';
import SimpleChart from './SimpleChart';
import { isNullOrUndefined, isNull } from 'util';
import { AnyTimeseries } from '../../typings/models/Timeseries';

export interface OwnProps {
  config: ConfigFactory,
  timeseries: AnyTimeseries,
  resourceId: string,
}

export interface StateProps {
  tsReadings: TimeseriesReadings,
}

export interface ActionProps {
  getReadings: (api: BaseApi, resourceId: string, timeseriesName:string, timeseriesId: string, range: TimeseriesRange) => any,
}

export interface State {
  currentRange: TimeseriesRange,
}

/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class TimeseriesCard extends Component<OwnProps & StateProps & ActionProps> {
  appApi: BaseApi;
  state: State = {
    currentRange: TimeseriesRange.EXTENT,
  }

  constructor(props: OwnProps & StateProps & ActionProps) {
    super(props);

    //@ts-ignore
    this.appApi = this.props.config.getAppApi();
  }

  getNotEnoughReadingsDialog() {
    //TODO: translations
    return (
      <View style={{
        flex: 10,
        justifyContent: 'center',
      }}>
        <Text style={{ textAlign: 'center' }}>Not enough readings for this time range.</Text>
      </View>
    );
  }

  getGraphView() {
    const { currentRange } = this.state;
    const { tsReadings, timeseries: {name}, resourceId } = this.props;

    const readings = tsReadings[getTimeseriesReadingKey(resourceId, name, currentRange)];

    if (!readings) {
      return this.getNotEnoughReadingsDialog();
    }  

    if (readings.meta.loading) {
      return (
        <View style={{
          flex: 5,
          justifyContent: 'center',
        }}>
          <Loading />
        </View>
      );
    }

    if (readings.pendingReadings.length + readings.readings.length === 0) {
      return this.getNotEnoughReadingsDialog();
    }

    return (
      <View style={{
        flex: 5,
        justifyContent: 'center'
      }}>
        <SimpleChart
          pendingReadings={readings.pendingReadings}
          readings={readings.readings}
          timeseriesRange={currentRange} 
        />
      </View>
    );
  }

  getBottomButtons() {
    const buttons: { text: string, value: TimeseriesRange }[] = [
      { text: '1Y', value: TimeseriesRange.ONE_YEAR},
      { text: '3M', value: TimeseriesRange.THREE_MONTHS},
      { text: '2W', value: TimeseriesRange.TWO_WEEKS},
      { text: 'EXTENT', value: TimeseriesRange.EXTENT},
    ];

    return (
      <View style={{
          borderColor: bgLightHighlight,
          borderTopWidth: 2,
          paddingTop: 3,
          marginBottom: 5,
          height: 35,
        }}>
        <View style={{
          flexDirection: 'row-reverse',
        }}>
          {buttons.map(b => (
            <Button
              key={b.text}
              color={this.state.currentRange === b.value ? primaryLight : primaryDark}
              buttonStyle={{
                backgroundColor: this.state.currentRange === b.value ? primaryDark : bgLight,
                paddingHorizontal: 5,
                height: 30,
              }}
              title={b.text}
              onPress={() => {
                if (b.value === this.state.currentRange) {
                  return;
                }

                this.setState({ currentRange: b.value });
                this.props.getReadings(this.appApi, this.props.resourceId, this.props.timeseries.name, this.props.timeseries.id, b.value);
              }}
            />
          ))}
        </View>
      </View>
    );
  }

  render() {
    const { timeseries: { name } } = this.props;

    return (
      <View 
        style={{
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: bgLight,
        }}
      >
        <Text 
          style={{
            paddingVertical: 5,
            textDecorationLine: 'underline',
            fontSize: 15,
            fontWeight: '600',
            alignSelf: 'center',
          }}>
          {name}
        </Text>
        {this.getGraphView()}
        {this.getBottomButtons()}
      </View>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {

  return {
    tsReadings: state.tsReadings,
  }
}

const mapDispatchToProps = (dispatch: any): ActionProps => {
  return {
    getReadings: (api: BaseApi, resourceId: string, timeseriesName: string, timeseriesId: string, range: TimeseriesRange) =>
      dispatch(appActions.getReadings(api, resourceId, timeseriesName, timeseriesId, range)),

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TimeseriesCard);