<script>
    import { onMount } from 'svelte';
    import Page from "$lib/client/components/Page.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import AnalyticsValueCard from "$lib/client/components/cards/AnalyticsValueCard.svelte";
    import AnalyticsChartCard from "$lib/client/components/cards/AnalyticsChartCard.svelte";

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
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            },
            yAxis: {
                type: 'value',
            },
            series: [{
                data: accessData,
                type: 'line',
                smooth: true,
                areaStyle: {
                    opacity: 0.3,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(139, 195, 74, 0.5)' },
                        { offset: 1, color: 'rgba(139, 195, 74, 0.1)' }
                    ])
                },
                lineStyle: { color: '#8BC34A', width: 3 },
                itemStyle: { color: '#8BC34A' }
            }]
        });

        // Category Chart (Pie)
        const categoryChart = echarts.init(categoryChartRef);
        categoryChart.setOption({
            tooltip: { trigger: 'item' },
            legend: {
                orient: 'vertical',
                left: 'left',
                top: 'middle',
            },
            series: [{
                name: 'Categories',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
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
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: {
                type: 'value',
            },
            yAxis: {
                type: 'category',
            },
            series: [{
                name: 'Requests',
                type: 'bar',
                label: { show: true, position: 'right' },
                data: topDatasetValues,
                itemStyle: {
                    color: '#8BC34A'
                }
            }]
        });

        // Volume Chart (Area)
        const volumeChart = echarts.init(volumeChartRef);
        volumeChart.setOption({
            tooltip: { trigger: 'axis' },
            legend: {
                data: ['Downloaded', 'Uploaded'],
                top: 20,
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            }],
            yAxis: [{
                type: 'value',
            }],
            series: [
                {
                    name: 'Downloaded',
                    type: 'line',
                    stack: 'Volume',
                    areaStyle: { opacity: 0.5, color: '#3CC0CF' },
                    lineStyle: { color: '#3CC0CF', width: 2 },
                    data: downloadData
                },
                {
                    name: 'Uploaded',
                    type: 'line',
                    stack: 'Volume',
                    areaStyle: { opacity: 0.5, color: '#8BC34A' },
                    lineStyle: { color: '#8BC34A', width: 2 },
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
                <AnalyticsValueCard title="Datasets" value="142"/>
            </Col>
            <Col>
                <AnalyticsValueCard title="Access Requests" value="2,845"/>
            </Col>
            <Col>
                <AnalyticsValueCard title="Data Transfers" value="1,230"/>
            </Col>
            <Col>
                <AnalyticsValueCard title="Growth Rate" value="24.7%"/>
            </Col>
        </Row>
    </Section>
    <Section>
        <Row xs={1} md={2}>
            <Col>
                <AnalyticsChartCard title="Dataset Access Over Time" bind:chart={accessChartRef}/>
            </Col>
            <Col>
                <AnalyticsChartCard title="Dataset Usage by Category" bind:chart={categoryChartRef}/>
            </Col>
            <Col>
                <AnalyticsChartCard title="Top Requested Datasets" bind:chart={topDatasetsChartRef}/>
            </Col>
            <Col>
                <AnalyticsChartCard title="Data Transfer Volume (GB)" bind:chart={volumeChartRef}/>
            </Col>
        </Row>
    </Section>

</Page>
