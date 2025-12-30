import { getAllStates } from '../missions/actions';
import CountyIssuesLookup from './CountyIssuesLookup';
import { Card, CardContent } from "@/components/ui/card";

export default async function NeighborLovePage() {
    const states = await getAllStates();

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="max-w-4xl mx-auto text-center mb-8">
                <h1 className="text-3xl font-bold text-qc-primary mb-3 font-display">Neighbor Love: Community Scout</h1>
                <p className="text-lg text-muted-foreground font-body">
                    &quot;And who is my neighbor?&quot; (Luke 10:29)
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <Card className="bg-white/50 backdrop-blur-sm border-2">
                    <CardContent className="p-6">
                        <CountyIssuesLookup initialStates={states} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
