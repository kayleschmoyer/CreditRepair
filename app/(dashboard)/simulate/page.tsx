import { aiProvider } from '../../../lib/ai';

export default function SimulatePage() {
  async function simulate(formData: FormData) {
    'use server';
    const score = Number(formData.get('score'));
    const delta = Number(formData.get('delta'));
    return await aiProvider.simulate(score, delta);
  }
  return (
    <div>
      <h1>Simulator</h1>
      <form action={simulate}>
        <label>Current Score <input name="score" defaultValue="650" /></label><br />
        <label>Utilization Change (%) <input name="delta" defaultValue="-10" /></label><br />
        <button type="submit">Simulate</button>
      </form>
    </div>
  );
}
