<script>
    import { onMount } from 'svelte';
    import Page from "$lib/client/components/Page.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import Card from "$lib/client/components/Card.svelte";

    let accessChartRef;
    let categoryChartRef;
    let topDatasetsChartRef;
    let volumeChartRef;

    // Dummy data for charts
    const accessData = [120, 132, 101, 134, 90, 230, 210];
    const categoryData = [
        { value: 335, name: 'Healthcare' },
        { value: 210, name: 'Finance' },
        { value: 184, name: 'Technology' },
        { value: 1548, name: 'Government' },
        { value: 148, name: 'Education' },
        { value: 120, name: 'Retail' }
    ];
    const topDatasets = ['COVID-19 Stats', 'Stock Prices', 'Weather Data', 'Population Census', 'Economic Indicators'];
    const topDatasetValues = [1200, 980, 760, 650, 540];
    const downloadData = [120, 132, 101, 134, 90, 230, 210];
    const uploadData = [220, 182, 191, 234, 290, 330, 310];

    // Initialize charts when component mounts
    onMount(async () => {
        const echarts = await import('echarts');

        // Access Chart (Line)
        const accessChart = echarts.init(accessChartRef);
        accessChart.setOption({
            title: {
                text: 'Access Requests',
                textStyle: { color: '#e0e0e0' }
            },
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: { lineStyle: { color: '#555' } },
                axisLabel: { color: '#aaa' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#555' } },
                axisLabel: { color: '#aaa' },
                splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
            },
            series: [{
                data: accessData,
                type: 'line',
                smooth: true,
                areaStyle: {
                    opacity: 0.3,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(77, 166, 255, 0.5)' },
                        { offset: 1, color: 'rgba(77, 166, 255, 0.1)' }
                    ])
                },
                lineStyle: { color: '#4da6ff', width: 3 },
                itemStyle: { color: '#4da6ff' }
            }]
        });

        // Category Chart (Pie)
        const categoryChart = echarts.init(categoryChartRef);
        categoryChart.setOption({
            title: {
                text: 'Dataset Categories',
                textStyle: { color: '#e0e0e0' }
            },
            tooltip: { trigger: 'item' },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'middle',
                textStyle: { color: '#e0e0e0' }
            },
            series: [{
                name: 'Categories',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#1e2832',
                    borderWidth: 2
                },
                label: { show: true, formatter: '{b}: {d}%' },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '14',
                        fontWeight: 'bold'
                    }
                },
                data: categoryData
            }]
        });

        // Top Datasets Chart (Bar)
        const topDatasetsChart = echarts.init(topDatasetsChartRef);
        topDatasetsChart.setOption({
            title: {
                text: 'Top 5 Requested Datasets',
                textStyle: { color: '#e0e0e0' }
            },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#555' } },
                axisLabel: { color: '#aaa' },
                splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
            },
            yAxis: {
                type: 'category',
                data: topDatasets,
                axisLine: { lineStyle: { color: '#555' } },
                axisLabel: { color: '#aaa' }
            },
            series: [{
                name: 'Requests',
                type: 'bar',
                label: { show: true, position: 'right', color: '#e0e0e0' },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#76d275' },
                            { offset: 1, color: '#4da6ff' }
                        ])
                    }
                },
                data: topDatasetValues,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#4da6ff' },
                        { offset: 1, color: '#76d275' }
                    ])
                }
            }]
        });

        // Volume Chart (Area)
        const volumeChart = echarts.init(volumeChartRef);
        volumeChart.setOption({
            title: {
                text: 'Data Transfer Volume (GB)',
                textStyle: { color: '#e0e0e0' }
            },
            tooltip: { trigger: 'axis' },
            legend: {
                data: ['Downloaded', 'Uploaded'],
                textStyle: { color: '#e0e0e0' }
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLine: { lineStyle: { color: '#555' } },
                axisLabel: { color: '#aaa' }
            }],
            yAxis: [{
                type: 'value',
                axisLine: { lineStyle: { color: '#555' } },
                axisLabel: { color: '#aaa' },
                splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
            }],
            series: [
                {
                    name: 'Downloaded',
                    type: 'line',
                    stack: 'Volume',
                    areaStyle: { opacity: 0.5, color: '#4da6ff' },
                    lineStyle: { color: '#4da6ff', width: 2 },
                    data: downloadData
                },
                {
                    name: 'Uploaded',
                    type: 'line',
                    stack: 'Volume',
                    areaStyle: { opacity: 0.5, color: '#76d275' },
                    lineStyle: { color: '#76d275', width: 2 },
                    data: uploadData
                }
            ]
        });

        // Handle window resize
        const handleResize = () => {
            accessChart.resize();
            categoryChart.resize();
            topDatasetsChart.resize();
            volumeChart.resize();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            accessChart.dispose();
            categoryChart.dispose();
            topDatasetsChart.dispose();
            volumeChart.dispose();
        };
    });
</script>

<Page title="Analytics">
    <Section>
        <Flexbox gap="1rem">
            <Button variant="primary">Last 7 Days</Button>
            <Button>Last 30 Days</Button>
            <Button>Last 90 Days</Button>
            <Button>Year to Date</Button>
        </Flexbox>
    </Section>
    <Section>
        <Row>
            <Col>
                <Card>
                    <h1>142</h1>
                    <span>Datasets</span>
                </Card>
            </Col>
            <Col>
                <Card>
                    <h1>2,845</h1>
                    <span>Access Requests</span>
                </Card>
            </Col>
            <Col>
                <Card>
                    <h1>1,230</h1>
                    <span>Data Transfers</span>
                </Card>
            </Col>
            <Col>
                <Card>
                    <h1>24.7%</h1>
                    <span>Growth Rate</span>
                </Card>
            </Col>
        </Row>
    </Section>
    <Section>
        <Row xs={1} md={2}>
            <Col>
                <Card>
                    <div class="chart-header">
                        <div class="chart-title">Dataset Access Over Time</div>
                        <div class="chart-actions">
                            <button><i class="fas fa-download"></i></button>
                            <button><i class="fas fa-expand"></i></button>
                        </div>
                    </div>
                    <div bind:this={accessChartRef} class="chart"></div>
                </Card>
            </Col>
            <Col>
                <Card>
                    <div class="chart-header">
                        <div class="chart-title">Dataset Usage by Category</div>
                        <div class="chart-actions">
                            <button><i class="fas fa-download"></i></button>
                            <button><i class="fas fa-expand"></i></button>
                        </div>
                    </div>
                    <div bind:this={categoryChartRef} class="chart"></div>
                </Card>
            </Col>
            <Col>
                <Card>
                    <div class="chart-header">
                        <div class="chart-title">Top Requested Datasets</div>
                        <div class="chart-actions">
                            <button><i class="fas fa-download"></i></button>
                            <button><i class="fas fa-expand"></i></button>
                        </div>
                    </div>
                    <div bind:this={topDatasetsChartRef} class="chart"></div>
                </Card>
            </Col>
            <Col>
                <Card>
                    <div class="chart-header">
                        <div class="chart-title">Data Transfer Volume</div>
                        <div class="chart-actions">
                            <button><i class="fas fa-download"></i></button>
                            <button><i class="fas fa-expand"></i></button>
                        </div>
                    </div>
                    <div bind:this={volumeChartRef} class="chart"></div>
                </Card>
            </Col>
        </Row>
    </Section>

</Page>

<style>

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .chart-title {
        font-size: 1.2rem;
        font-weight: 600;
    }

    .chart-actions {
        display: flex;
        gap: 10px;
    }

    .chart-actions button {
        background: rgba(70, 100, 150, 0.3);
        border: none;
        color: #e0e0e0;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .chart-actions button:hover {
        background: rgba(70, 100, 150, 0.6);
    }

    .chart {
        height: 350px;
        width: 100%;
    }
</style>
