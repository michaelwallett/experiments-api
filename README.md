experiments-api
===============

Add an experiment:
```
curl -XPUT 'http://localhost:3000/experiments/conversionIsBetterWithComicSansFont' -d '{
    "targeting": {
        "query": {
            "bool": {
                "must": [
                    {
                        "match": {
                            "metroId": 72
                        }
                    },
                    {
                        "terms": {
                            "environment": [
                                "searchpage",
                                "restprofilepage"
                            ]
                        }
                    }
                ]
            }
        }
    },
    "percentage": 50
}'
```

Then see if the experiment is running for the session in the given environment:
```
curl -XGET 'http://localhost:3000/environments/searchpage/sessions/b79e1646-e27c-463c-8393-eca79d0403cc/running-experiments?metroId=72'
```
