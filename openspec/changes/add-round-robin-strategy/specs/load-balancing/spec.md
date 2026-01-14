## ADDED Requirements

### Requirement: Round-Robin Load Balancing Strategy

The system SHALL provide a round-robin load balancing strategy that distributes incoming requests sequentially across multiple available accounts.

#### Scenario: Round-robin distributes requests evenly
- **WHEN** two or more accounts are available (not rate-limited, not paused)
- **AND** the round-robin strategy is selected
- **THEN** requests are distributed sequentially across accounts (A, B, A, B, ...)
- **AND** each account receives approximately equal request volume over time

#### Scenario: Round-robin skips unavailable accounts
- **WHEN** some accounts are rate-limited or paused
- **AND** the round-robin strategy is selected
- **THEN** only available accounts are included in rotation
- **AND** requests cycle through available accounts only

#### Scenario: Round-robin with single account
- **WHEN** only one account is available
- **AND** the round-robin strategy is selected
- **THEN** all requests are routed to the single available account

#### Scenario: Round-robin strategy selection
- **WHEN** user selects round-robin strategy via dashboard dropdown
- **THEN** the strategy is immediately applied to subsequent requests
- **AND** the selection is persisted in configuration

### Requirement: Strategy Enum Extension

The system SHALL extend the StrategyName enum to include RoundRobin as a valid option.

#### Scenario: Strategy validation
- **WHEN** validating a strategy name
- **THEN** "round-robin" is accepted as a valid strategy
- **AND** invalid strategy names are rejected with an error

#### Scenario: Strategy listing
- **WHEN** querying available strategies via API
- **THEN** "round-robin" is included in the list of available strategies
