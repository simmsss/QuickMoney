// Version of Solidity
pragma solidity >=0.5.0;

// QuickMoney Contract
contract QuickMoney {

    uint public loanCount = 0; // Track the total number of loans 
    uint public requestsCount = 0; // Track the total number of requests 
    mapping(uint => Loan) public loans; // Mapping of loan id to loan struct
    mapping(uint => Request) public requests; // Mapping of request id to request struct

    using SafeMath for int256;
    
    // Certificate Structure
    struct Loan {
        uint identity; // Unique identifier
        string loanDetail; // Loan display name
        uint loanAmount; // Needed amount
        uint loanPaid; // Paid value in the loan
        uint interest;
        uint rating;
        uint period;
        uint holding;
        address payable loanee; // Creator's address
        address payable loaner;
        mapping(address => bool) recipientsMapping; // Details of all recipients
        bool sanctioned;
        uint remaining;
        bool payedoff;
    }
    
    // Request Structure
    struct Request {
        uint id; // Unique identifies
        string loanDetail; // Associated loan details
        uint value; // Value of crypto sent
        uint loanId; // Unique identifier of the loan
        address payable loanee; // Address of loanee
        address payable loaner; // Address of requester
        bool approved; // Approval Status
        uint interest;
        uint months;
    }
    
    // Create a new loan
    function newLoan(string memory detail, uint amount, uint rating) public {
        Loan storage c = loans[loanCount]; // New loan object
        c.identity = loanCount; // Set identifier
        c.loanDetail = detail; // Set certificate name
        c.loanee = msg.sender; // Set creator's address
        c.loanAmount = amount; // Set loan cost
        c.loanPaid = 0; // Value of loan paid off
        c.rating = rating;
        loanCount++; // Increment identifier for subsequent creation
    }

    function payoff(uint _id, uint value) public payable {
        Loan storage l = loans[_id]; // Fetch associated loan

        l.loanPaid = l.loanPaid + value;
        l.remaining = l.remaining - value;
        if(l.remaining <= 0){
            l.payedoff = true;
        }
        l.loaner.transfer(msg.value);
    }
    
    // Send Interest Request
    function interestRequest(uint _id, uint interest, uint months) public payable {
        Loan storage l = loans[_id]; // Fetch associated loan
        
        Request storage r = requests[requestsCount]; // Fetch associated request
        r.id = requestsCount; // Set identifier
        r.interest = interest; // Set interest proposal
        r.months = months; // Set months 
        r.value = msg.value; // Set value
        r.loanDetail = l.loanDetail; // Set name
        r.loanee = l.loanee; // Set loanee
        r.loanId = _id; // Set loan identifier
        r.loaner = msg.sender; // Set loaner's address
        requestsCount++; // Increment request count
    }
    
    // Approve request
    function approveRequest(uint _id, uint reqid, uint amt) public payable {
        Loan storage l = loans[_id]; // Fetch associated loan
        require(msg.sender == l.loanee, 'You are not authorised'); // Check authorisation

        Request storage r = requests[reqid]; // Fetch associated request
        r.approved = true; // Set approval status to true
        
        l.sanctioned = true; // Grant loan
        l.loaner = r.loaner; // Set loaner
        l.interest = r.interest;
        l.period = r.months;
        l.loanPaid = 0;
        l.remaining = amt;
        l.payedoff = false;
        msg.sender.transfer(l.loanAmount); // Collect money
    }
    
    // Decline request
    function declineRequest(uint _id, uint reqid) public payable {
        Loan storage l = loans[_id]; // Fetch associated loan
        require(msg.sender == l.loanee, 'You are not authorised'); // Check authorisation

        Request storage r = requests[reqid]; // Fetch associated request
        r.approved = false; // Set approval status to false
        r.loaner.transfer(l.loanAmount); // Refund the amount to the student
        delete requests[reqid]; // Delete request
    }

    // Cancel proposal
    function cancelProposal(uint _id, uint reqid) public payable {
        Loan storage l = loans[_id]; // Fetch associated loan

        Request storage r = requests[reqid]; // Fetch associated request
        require(msg.sender == r.loaner, 'You are not authorised'); // Check authorisation
        r.approved = false; // Set approval status to false
        msg.sender.transfer(l.loanAmount); // Refund the amount to the lender
        delete requests[reqid]; // Delete request
    }
    
}

library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}