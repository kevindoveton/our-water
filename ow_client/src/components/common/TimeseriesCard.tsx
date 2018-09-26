import * as React from 'react'; import { Component } from 'react';
import {
  Avatar,
  Button,
  Card,
  Text,
} from 'react-native-elements';
import { OWTimeseries, Reading, TimeseriesRange } from '../../typings/models/OurWater';
import { View } from 'react-native';
import { textLight, primaryDark, bgLight } from '../../utils/Colors';
import LineChartExample from './DemoChart';


export interface Props {
  timeseries: OWTimeseries,
  initialReadings: Reading[], //The readings initially loaded, this may change if user changes the time scale
}

export interface State {

}


/**
 *  TimeseriesCard is a card that displays a timeseries graph,
 *  along with some basic controls for changing the time scale
 */
class TimeseriesCard extends Component<Props> {


  getGraphView() {

    return (
      <View style={{
        // backgroundColor: 'red',
        flex: 5,
        justifyContent: 'center'
      }}>
        <LineChartExample/>
      </View>
    );
  }

  getBottomButtons() {
    const buttons: { text: string, value: TimeseriesRange}[] = [
      { text: '1Y', value: TimeseriesRange.ONE_YEAR},
      { text: '3M', value: TimeseriesRange.THREE_MONTHS},
      { text: '2W', value: TimeseriesRange.TWO_WEEKS},
      { text: 'EXTENT', value: TimeseriesRange.EXTENT},
    ];

    return (
      <View style={{
          flex: 1,
          borderColor: textLight,
          borderTopWidth: 2,
          maxHeight: 40,
        }}>
        <View style={{
          flexDirection: 'row-reverse',
        }}>
          {buttons.map(b => (
            <Button
              key={b.text}
              color={primaryDark}
              buttonStyle={{
                backgroundColor: bgLight,
                paddingHorizontal: 5,
                height: 30,
              }}
              title={b.text}
              onPress={() => console.log("TODO: zoom to:", b.value)}
            />
          ))}
        </View>
      </View>
    );
  }

  render() {
    const { timeseries: { name } } = this.props;

    return (
      <Card
        containerStyle={{
          width: '90%',
          height: '90%',
          padding: 0,
        }}
        >
        <View style={{
          flexDirection: 'column',
          height: '100%',
        }}>
          <Text style={{
            flex: 1,
            paddingVertical: 10,
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
      </Card>
    )
  }
}

export default TimeseriesCard;