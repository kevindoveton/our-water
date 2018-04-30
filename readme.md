



## Firebase Cloudstore

We are using Firebase Cloudstore NoSQL database for our database needs.

Proposed data structure:


org
  |- name
  |-
  |---- location (collection)
         |- type
         |- shapefile?
  |
  |
  |
  |
  |
  |---- resource (collection)
          |- type
          |- latlng



const locationTypes: {
  village
  pincode

}

const resourceTypes: {
  well
  checkdam
  raingauge
  custom
}


const resourceMetadata: {
  well
}




## Cloud Firestore evaluation:


good:
- easy to use
- visual console
- database triggers, for really serverless architecture
- no need for a
- cheap
- realtime


bad:
- no geo queries
- no multiple filters/composite queries



Can we get around geo queries?
- add a location id to each resource and reading?
- only search by boxes?
  - we can do geo queries with just squares.


```js
resource: {
  id: string
  readings: collection,
  lastReading:
  location: {
    latitude:
    longitude:
  },
  type: {
    well: true,
    checkdam: false,
    raingauge: false
  }
}

reading: {
  id:
  date:
  value:
  type: {
    well: true,
    checkdam: false,
    raingauge: false
  }
  location: {
    latitude:
    longitude:
  }
}

```


This seems like a better way to structure our data.
```js
{
  org: {
    groups: {
      village1: {
        type: village

      },
      india: {
        type: country
      },
      pincode123456: {
        type: pincode
      }
    },
    resource: {
      one: {
        lastReading:
        latLng:
        name:
        owner:
        average:
        type:
        // This is an index?
        groups: {
          village1: true,
          india: true,
        }
      }
    },
    reading: {
      r1: {
        resourceId: one
        value: 12.4,
        datetime: 2018-01-01...
        latLng:
        groups: {
          village1: true
        }
      }
    }
  }
}

//Maybe instead of nesting:
org/orgId/reading/resourceId/value/readingId, we should have a resourceId field on reading...



```

challenges with this approach:

- we need to make sure that update fields properly




TODO: 

- endpoints for group based queries
  
  getReadingsForGroup(group) [done]
  getReadingsForResource() [done]
  getResourcesForGroup() []

  queries for graph data?
  - getAverageForGroup(group, resourceType, startTime, endTime) []
  - others?


- getResourcesNearLocation(lat, lng, distance) [done]

- write down proper type definitions and figure out typescript
- start working on fast static group/resource detail page?
- investigate legacy id compatability


- secure the endpoints
- when registering a new resource, allow user to select from a number of groups
- when registering a new resource, add extra fields for each resource type. Eg. Well.maxDepth
- ow_admin: list resources by groups


Authentication example:
https://github.com/firebase/functions-samples/tree/master/authorized-https-endpoint