import graphviz
from automata.fa.dfa import DFA
from automata.fa.nfa import NFA
import re
import sys

def regex_to_dfa_graph(regex):
    try:
        regex = regex.strip()  # Remove unwanted newline characters

        if not isinstance(regex, str):
            raise ValueError("The regex argument must be a string.")
        
        if not re.compile(regex):
            raise ValueError("Invalid regular expression.")

        nfa = NFA.from_regex(regex)

        dfa = DFA.from_nfa(nfa)

        dfa = dfa.minify()

        print(f"States: {dfa.states}")
        print(f"Final States: {dfa.final_states}")
        print(f"Transitions: {dfa.transitions}")

        # Step 4: Convert DFA to Graphviz Graph
        dot = graphviz.Digraph(format='png')
        dot.attr(rankdir='LR')
        dot.attr('node', shape='circle')

        dot.node("start", shape="none", label="start")
        dot.edge("start", str(dfa.initial_state))

        for state in sorted(dfa.states, key=str):
            state = str(state)
            if state == dfa.initial_state:
                dot.node(state, style='bold', color='black')
            elif state in map(str, dfa.final_states):
                dot.node(state, peripheries='2')
            else:
                dot.node(state)

        for state, transitions in dfa.transitions.items():
            state = str(state)  # Convert state to string
            for symbol, target_state in transitions.items():
                dot.edge(state, str(target_state), label=symbol)

        return dot

    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    regex = sys.stdin.read().strip()

    if not regex:
        print("Error: No regex provided.")
        sys.exit(1)

    dfa_graph = regex_to_dfa_graph(regex)

    if dfa_graph:
        output_path = "dfa_graph"
        dfa_graph.render(output_path, format="png", cleanup=True)
        print(f"DFA graph rendered successfully. Saved as {output_path}.png")
    else:
        print("Failed to generate DFA graph.")
