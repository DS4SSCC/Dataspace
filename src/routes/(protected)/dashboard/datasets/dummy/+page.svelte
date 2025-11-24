<script>
    import Page from "$lib/client/components/Page.svelte";
    import Row from "$lib/client/components/grid/Row.svelte";
    import Col from "$lib/client/components/grid/Col.svelte";
    import Section from "$lib/client/components/Section.svelte";
    import SectionHeader from "$lib/client/components/SectionHeader.svelte";
    import Input from "$lib/client/components/form/Input.svelte";
    import Flexbox from "$lib/client/components/Flexbox.svelte";
    import Card from "$lib/client/components/Card.svelte";
    import Button from "$lib/client/components/Button.svelte";
    import Icon from "$lib/client/components/icons/Icon.svelte";
    import {goto} from "$app/navigation";

    // Mock data - vervang dit met je echte dataset data
    const dataset = {
        id: "dataset-123",
        title: "Bevolkingsstatistieken Nederland 2024",
        description: "Maandelijkse bevolkingsstatistieken per gemeente, inclusief geboortes, sterftecijfers en migratie.",
        version: "2.1.0",
        lastUpdated: "2024-01-15T10:30:00Z",
        publisher: "Centraal Bureau voor de Statistiek",
        license: "CC BY 4.0",
        tags: ["bevolking", "statistieken", "gemeente", "demografie"],
        format: "JSON",
        size: "2.4 GB",
        recordCount: 125000,
        accessLevel: "public",
        compliance: {
            gdpr: true,
            iso27001: true,
            gdprStatus: "compliant"
        },
        governance: {
            owner: "Jan Jansen",
            steward: "Karin Visser",
            qualityScore: 95,
            classification: "public",
            retentionPeriod: "7 years"
        },
        federation: {
            sourceSystem: "CBS Data Warehouse",
            syncFrequency: "daily",
            replicationStatus: "active",
            federatedWith: ["Rijksoverheid.nl", "OpenData Portal"],
            apiEndpoint: "https://api.cbs.nl/v2/population"
        },
        usage: {
            downloads: 1245,
            views: 8934,
            apiCalls: 23456
        }
    };
</script>

<Page title={dataset.title} description={dataset.description}>
    {#snippet prefix()}
        <Button style="margin-bottom: 1rem" size="sm" onclick={()=> goto('/dashboard/datasets')}>
            <Icon icon="arrow-left" margin="right"/>
            Datasets
        </Button>
    {/snippet}
    {#snippet suffix()}
        <Flexbox gap="0.5rem" style="margin-top: 1rem;">
            {#each dataset.tags as tag}
                <Button size="xs">{tag}</Button>
            {/each}
        </Flexbox>
    {/snippet}
    <Section>
        <SectionHeader title="Dataset Info"/>
        <Card style="padding: 1.5rem;">
            <div style="margin-bottom: 1rem;">
                <small style="color: var(--color-text-secondary);">Format</small>
                <p>{dataset.format}</p>
            </div>
            <div style="margin-bottom: 1rem;">
                <small style="color: var(--color-text-secondary);">Grootte</small>
                <p>{dataset.size}</p>
            </div>
            <div style="margin-bottom: 1rem;">
                <small style="color: var(--color-text-secondary);">Records</small>
                <p>{dataset.recordCount.toLocaleString()}</p>
            </div>
            <div style="margin-bottom: 1rem;">
                <small style="color: var(--color-text-secondary);">Laatst bijgewerkt</small>
                <p>{new Date(dataset.lastUpdated).toLocaleDateString('nl-NL')}</p>
            </div>
            <div>
                <small style="color: var(--color-text-secondary);">Toegangsniveau</small>
                <Button size="xs" variant={dataset.accessLevel === 'public' ? 'success' : 'warning'}>
                    {dataset.accessLevel}
                </Button>
            </div>
            <Flexbox gap="0.5rem" justify="flex-end">
                <Button variant="outline" size="sm">
                    <Icon icon="download" margin="right"/>Download
                </Button>
                <Button variant="primary" size="sm">
                    <Icon icon="code" margin="right"/>API
                </Button>
            </Flexbox>
        </Card>
    </Section>

    <Section>
        <SectionHeader title="Governance"/>
        <Row>
            <Col xs={12} md={6}>
                <Card style="padding: 1.5rem;">
                    <h5 style="margin-top: 0; margin-bottom: 1rem;">Rechten en Toegang</h5>
                    <div style="margin-bottom: 1rem;">
                        <Flexbox>
                            <Input type="checkbox" checked={true}/>
                            <span style="font-size: small; font-weight: 500">Lezen</span>
                        </Flexbox>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <Flexbox>
                            <Input type="checkbox" checked={false}/>
                            <span style="font-size: small; font-weight: 500">Schrijven</span>
                        </Flexbox>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <Flexbox>
                            <Input type="checkbox" checked={false}/>
                            <span style="font-size: small; font-weight: 500">Beheren</span>
                        </Flexbox>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <Flexbox>
                            <Input type="checkbox" checked={true}/>
                            <span style="font-size: small; font-weight: 500">Downloaden</span>
                        </Flexbox>
                    </div>
                </Card>
            </Col>
            <Col xs={12} md={6}>
                <Card style="padding: 1.5rem;">
                    <h5 style="margin-top: 0; margin-bottom: 1rem;">Beheer</h5>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">Data Owner</small>
                        <p>{dataset.governance.owner}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">Data Steward</small>
                        <p>{dataset.governance.steward}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">Classificatie</small>
                        <Button size="xs" variant="primary">{dataset.governance.classification}</Button>
                    </div>
                    <div>
                        <small style="color: var(--color-text-secondary);">Kwaliteitsscore</small>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                            <div style="flex: 1; height: 8px; background: var(--color-gray-200); border-radius: 4px; overflow: hidden;">
                                <div style={`width: ${dataset.governance.qualityScore}%; height: 100%; background: var(--color-success);`}></div>
                            </div>
                            <span>{dataset.governance.qualityScore}%</span>
                        </div>
                    </div>
                </Card>
            </Col>
            <Col xs={12} md={6}>
                <Card style="padding: 1.5rem;">
                    <h5 style="margin-top: 0; margin-bottom: 1rem;">Compliance</h5>
                    <div style="margin-bottom: 1rem;">
                        <Flexbox justify="space-between">
                            <span>GDPR</span>
                            <Button size="xs" variant={dataset.compliance.gdpr ? 'success' : 'danger'}>
                                {dataset.compliance.gdpr ? 'Compliant' : 'Non-compliant'}
                            </Button>
                        </Flexbox>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <Flexbox justify="space-between">
                            <span>ISO 27001</span>
                            <Button size="xs" variant={dataset.compliance.iso27001 ? 'success' : 'danger'}>
                                {dataset.compliance.iso27001 ? 'Certified' : 'Not certified'}
                            </Button>
                        </Flexbox>
                    </div>
                    <div>
                        <small style="color: var(--color-text-secondary);">Retentieperiode</small>
                        <p>{dataset.governance.retentionPeriod}</p>
                    </div>
                </Card>
            </Col>
            <Col xs={12} md={6}>
                <Card style="padding: 1.5rem;">
                    <h5 style="margin-top: 0; margin-bottom: 1rem;">Gebruik</h5>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">Downloads</small>
                        <p>{dataset.usage.downloads.toLocaleString()}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">Weergaven</small>
                        <p>{dataset.usage.views.toLocaleString()}</p>
                    </div>
                    <div>
                        <small style="color: var(--color-text-secondary);">API Calls</small>
                        <p>{dataset.usage.apiCalls.toLocaleString()}</p>
                    </div>
                </Card>
            </Col>
        </Row>
    </Section>

    <Section>
        <SectionHeader title="Federatie"/>
        <Row>
            <Col xs={12} md={6}>
                <Card style="padding: 1.5rem;">
                    <h5 style="margin-top: 0; margin-bottom: 1rem;">Bron Systeem</h5>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">Systeem</small>
                        <p>{dataset.federation.sourceSystem}</p>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">Synchronisatie</small>
                        <Button size="xs" variant="primary">{dataset.federation.syncFrequency}</Button>
                    </div>
                    <div>
                        <small style="color: var(--color-text-secondary);">Status</small>
                        <Button size="xs" variant={dataset.federation.replicationStatus === 'active' ? 'success' : 'warning'}>
                            {dataset.federation.replicationStatus}
                        </Button>
                    </div>
                </Card>
            </Col>
            <Col xs={12} md={6}>
                <Card style="padding: 1.5rem;">
                    <h5 style="margin-top: 0; margin-bottom: 1rem;">API Endpoint</h5>
                    <div style="margin-bottom: 1rem;">
                        <small style="color: var(--color-text-secondary);">URL</small>
                        <p style="font-family: monospace; background: var(--color-gray-100); padding: 0.5rem; border-radius: 4px; word-break: break-all;">
                            {dataset.federation.apiEndpoint}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" style="width: 100%;">
                        <Icon icon="clipboard" margin="right"/>Kopieer URL
                    </Button>
                </Card>
            </Col>
            <Col xs={12}>
                <Card style="padding: 1.5rem;">
                    <h5 style="margin-top: 0; margin-bottom: 1rem;">Gefedereerde Systemen</h5>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        {#each dataset.federation.federatedWith as system}
                            <Button size="xs" variant="outline">{system}</Button>
                        {/each}
                    </div>
                </Card>
            </Col>
        </Row>
    </Section>

    <Section>
        <SectionHeader title="Schema"/>
        <Card style="padding: 1.5rem;">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                    <tr style="background: var(--color-gray-100);">
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-200);">Veldnaam</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-200);">Type</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-200);">Beschrijving</th>
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-gray-200);">Verplicht</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">id</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">string</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Unieke identificatie</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Ja</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">gemeente</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">string</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Gemeentenaam</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Ja</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">populatie</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">integer</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Aantal inwoners</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Ja</td>
                    </tr>
                    <tr>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">datum</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">date</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Peildatum</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid var(--color-gray-200);">Ja</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </Section>
</Page>
