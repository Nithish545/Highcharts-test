import {
  ChartConfig,
  ChartModel,
  Query,
  getChartContext,
} from '@thoughtspot/ts-chart-sdk';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/gantt.src';
import _ from 'lodash'
// import _ from 'lodash';

const theme1 = {
    colors: ['rgb(250, 153, 28)', 'hsl(190, 67%, 34%)', '#F07B7B', '#032539'],
  };
  const theme2 = {
    colors: ['#FFD700', '#8B0000', '#008B8B', '#4B0082'],
  };
  const theme3 = {
    colors: ['#FF5733', '#33FF57', '#3357FF', '#FF33A5'],
  };

const getDataModel = (chartModel: any) => {
  const dataArr = chartModel.data[0].data;
//   create point from data
  const points = dataArr[0].dataValue.map((_val: string, idx: number) => {
      return {
          id: `${dataArr[0].dataValue[idx]} ${dataArr[1].dataValue[idx]}`,
          parent: dataArr[0].dataValue[idx],
          name: dataArr[1].dataValue[idx],
          start: new Date(dataArr[2].dataValue[idx]).getTime(),
          end: new Date(dataArr[3].dataValue[idx]).getTime(),
          completed: {
              amount: dataArr[4]?.dataValue[idx],
          },
          dependency: `${dataArr[0]?.dataValue[idx]} ${dataArr[5]?.dataValue[idx]}`,
      };
  });

  // create projects from points & data
  
  const projects = [
    "Project 1",
    "Project 2",
  
];
  const dataSeries = projects.map((project: any) => {
      const filteredPoints = points.filter(
          (point: any) => point.parent === project,
      );
      return {
          name: project,
          data: [
              ...filteredPoints,
              {
                  id: project,
                  name: project,
              },
          ],
      };
  });
  
  // get max and min date
  const maxDate = _.max([...dataArr[2].dataValue, ...dataArr[2].dataValue]);
  const minDate = _.min([...dataArr[2].dataValue, ...dataArr[2].dataValue]);

  return {
      dataSeries,
      maxDate,
      minDate,
  };
};

const renderChart = (ctx: any) => {
  const chartModel = ctx.getChartModel();
  const dataModel = getDataModel(chartModel);
  Highcharts.setOptions(theme1);
  // THE CHART
  Highcharts.ganttChart('container', {
      title: {
          text: 'Gantt Chart with Progress Indicators',
          align: 'left',
      },

      xAxis: {
          min: 1410048000000,
          max: 1417910400000,
        labels: {
            style: {
              fontSize: '12px', // Adjust the font size as needed
            },
          },
      },
   
      accessibility: {
          point: {
              descriptionFormat:
                  '{yCategory}. ' +
                  '{#if completed}Task {(multiply completed.amount 100):.1f}% completed. {/if}' +
                  'Start {x:%Y-%m-%d}, end {x2:%Y-%m-%d}.',
          },
      },

      lang: {
          accessibility: {
              axis: {
                  xAxisDescriptionPlural:
                      'The chart has a two-part X axis showing time in both week numbers and days.',
              },
          },
      },

      series: dataModel.dataSeries,
  } as any);
  return Promise.resolve();
};

const init = async () => {
  const ctx = await getChartContext({
      getDefaultChartConfig: (chartModel: ChartModel): ChartConfig[] => {
          const columns = chartModel.columns;

          // Here we assume that the columns are always coming in the
          // following order.
          // [Project Name, Task, Start Date, End Date, Completion]

          // TBD: do basic validation here to ensure that the chart is renderable
          if (columns.length < 4) {
              // not possible to plot a chart
              return [];
          }

          const chartConfig: ChartConfig = {
              key: 'default',
              dimensions: [
                  {
                      key: 'project-name',
                      columns: [columns[0]],
                  },
                  {
                      key: 'task',
                      columns: [columns[1]],
                  },
                  {
                      key: 'start-date',
                      columns: [columns[2]],
                  },
                  {
                      key: 'end-date',
                      columns: [columns[3]],
                  },
                  {
                      key: 'completion',
                      columns: columns[4] ? [columns[4]] : [],
                  },
              ],
          };
          return [chartConfig];
      },
      getQueriesFromChartConfig: (
          chartConfig: ChartConfig[],
      ): Array<Query> => {
          // map all the columns in the config to the query array
          return chartConfig.map(
              (config: ChartConfig): Query =>
                  _.reduce(
                      config.dimensions,
                      (acc: Query, dimension: any) => ({
                          queryColumns: [
                              ...acc.queryColumns,
                              ...dimension.columns,
                          ],
                      }),
                      {
                          queryColumns: [],
                      } as Query,
                  ),
          );
      },
      renderChart: (context) => renderChart(context),
  });
};

init();



//// Chart 2 =================================================================================================================


const sampleData: any = {
    columns: [
        { id: '1', name: 'Category', dataValue: ['A', 'B', 'C', 'D'] },
        { id: '2', name: 'Value', dataValue: ['10', '20', '30', '40']},
    ],
    data: [
        {
            data: [
                { dataValue: ['A', 'B', 'C', 'D'] },
                { dataValue: ['10', '20', '30', '40'] },
            ],
        },
    ],
};

const getDataModel2 = (chartModel: any) => {
    const dataArr = chartModel.data[0].data;

    // Create points from data for pie chart
    const points = dataArr[0].dataValue.map((_val: string, idx: number) => {
        return {
            name: dataArr[0].dataValue[idx],
            y: parseFloat(dataArr[1].dataValue[idx]),
        };
    });

    return {
        dataSeries: [{
            type: 'pie',
            name: 'Sample Data',
            data: points,
        }],
    };
};

const renderChart2 = (ctx: any) => {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel2(chartModel);
    Highcharts.setOptions(theme2);
    // THE CHART
    Highcharts.chart('container1', {
        chart: {
            type: 'pie',
        },
        title: {
            text: 'Pie Chart Example',
        },
        series: dataModel.dataSeries,
        plotOptions: {
            series: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: [{
                    enabled: true,
                    distance: 10
                }, {
                    enabled: true,
                    distance: -20,
                    format: '{point.percentage:.1f}%',
                    style: {
                        fontSize: '12px',
                        textOutline: 'none',
                        opacity: 0.7
                    },
                    filter: {
                        operator: '>',
                        property: 'percentage',
                        value: 1
                    }
                }]
            }
        },
    } as any);

    return Promise.resolve();
};

const init2 = async () => {
    const ctx = {
        getChartModel: () => sampleData,
    };

    const chartModel = ctx.getChartModel();

    const chartConfig: ChartConfig = {
        key: 'default',
        dimensions: [
            {
                key: 'category',
                columns: [chartModel.columns[0]],
            },
            {
                key: 'value',
                columns: [chartModel.columns[1]],
            },
        ],
    };

    const query: Query = {
        queryColumns: [
            ...chartConfig.dimensions[0].columns,
            ...chartConfig.dimensions[1].columns,
        ],
    };

    await renderChart2(ctx);
};

init2();


//// Chart 3 =================================================================================================================


const sampleData2: any = {
    columns: [
        { id: '1', name: 'Category', dataValue: ['A', 'B', 'C', 'D'] },
        { id: '2', name: 'Value', dataValue: ['10', '30', '50', '70']},
    ],
    data: [
        {
            data: [
                { dataValue: ['A', 'B', 'C', 'D'] },
                { dataValue: ['10', '30', '50', '70'] },
            ],
        },
    ],
};

const getDataModel3 = (chartModel: any) => {
    console.log(chartModel, 'chartModel - 1')
    const dataArr = chartModel.data[0].data;
    console.log(dataArr, 'dataArr - 2')

    // Create points from data for pie chart
    const points = dataArr[0].dataValue.map((_val: string, idx: number) => {
        return {
            name: dataArr[0].dataValue[idx],
            y: parseFloat(dataArr[1].dataValue[idx]),
        };
    });
    console.log(points, 'points - 3')
    return {
        dataSeries: [{
            type: 'column',
            name: 'Bar Chart sample Data',
            data: points,
        }],
    };
};

const renderChart3 = (ctx: any) => {
    const chartModel = ctx.getChartModel();
    const dataModel = getDataModel3(chartModel);

    console.log('dataModel: - 4', dataModel);
    Highcharts.setOptions(theme3);
    // THE CHART
    Highcharts.chart('container2', {
        chart: {
            type: 'column',
        },
        xAxis: {
            title: {
                text: 'Countries'
            },
            categories: ['USA', 'Korea', 'Brazil', 'EU', 'India', 'Russia', 'Australia', 'China', 'Japan', 'USA2', 'Korea2', 'Brazil2' ],
        },
        yAxis: {
            title: {
                text: 'Fruit eaten'
            },
            tickInterval: 1
        },
        // series: dataModel.dataSeries,
        series: [
            {
            name: 'Jane',
            data: [1, 0.5, 4, 6, 2.5, 1.2]
            }, 
            {
                name: 'John',
                data: [1.0, 2, 3, 1.0, 2, 3, 1.0, 2, 3, 1.0, 2, 3]
            },
            {
                name: 'Justin',
                data: [1, 0.5, 4]
            }, 
            {
                name: 'Beiber',
                data: [2.0, 7, 3]
            },
            {
                name: 'Alan',
                data: [1, 0.5, 4, 1, 0.5, 4, 1, 0.5, 4, 1, 0.5, 4]
            }, 
            {
                name: 'Walker',
                data: [4.0, 5, 3]
            },
            {
                name: 'Christopher',
                data: [1, 0.5, 4]
            }, 
            {
                name: 'Nolan',
                data: [3.0, 7, 3]
            },
            {
                name: 'Tony',
                data: [1, 0.5, 4]
            }, 
            {
                name: 'Stark',
                data: [2.0, 3, 3]
            },
        ]
    } as any);

    return Promise.resolve();
};

const init3 = async () => {
    const ctx = {
        getChartModel: () => sampleData2,
    };

    // const chartModel = ctx.getChartModel();

    // const chartConfig: ChartConfig = {
    //     key: 'default',
    //     dimensions: [
    //         {
    //             key: 'category',
    //             columns: [chartModel.columns[1]],
    //         },
    //         {
    //             key: 'value',
    //             columns: [chartModel.columns[0]],
                
    //         },
    //     ],
    // };

    await renderChart3(ctx);
};

init3();