using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceTracker.API.Data;
using FinanceTracker.API.Models;

namespace FinanceTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController(AppDbContext context) : ControllerBase
    {
        private readonly AppDbContext _context = context;

        // GET: api/transactions?type=Income&category=Salary&startDate=2024-01-01&endDate=2024-12-31
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions(
            [FromQuery] string? type = null,
            [FromQuery] string? category = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Transactions.AsQueryable();

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(t => t.Type == type);
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(t => t.Category == category);
            }

            if (startDate.HasValue)
            {
                query = query.Where(t => t.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.Date <= endDate.Value);
            }

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return Ok(transactions);
        }

        // GET: api/transactions/summary
        [HttpGet("summary")]
        public async Task<ActionResult> GetSummary(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Transactions.AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(t => t.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.Date <= endDate.Value);
            }

            var transactions = await query.ToListAsync();

            var totalIncome = transactions
                .Where(t => t.Type == "Income")
                .Sum(t => t.Amount);

            var totalExpense = transactions
                .Where(t => t.Type == "Expense")
                .Sum(t => t.Amount);

            var balance = totalIncome - totalExpense;

            var summary = new
            {
                totalIncome,
                totalExpense,
                balance,
                transactionCount = transactions.Count
            };

            return Ok(summary);
        }

        // GET: api/transactions/reports/monthly?months=12
        [HttpGet("reports/monthly")]
        public async Task<ActionResult> GetMonthlyReports([FromQuery] int months = 12)
        {
            var endDate = DateTime.Now;
            var startDate = endDate.AddMonths(-months);

            var transactions = await _context.Transactions
                .Where(t => t.Date >= startDate && t.Date <= endDate)
                .OrderBy(t => t.Date)
                .ToListAsync();

            var monthlyData = transactions
                .GroupBy(t => new { 
                    Year = t.Date.Year, 
                    Month = t.Date.Month 
                })
                .Select(g => new
                {
                    year = g.Key.Year,
                    month = g.Key.Month,
                    monthLabel = $"{new DateTime(g.Key.Year, g.Key.Month, 1):MMM yyyy}",
                    totalIncome = g.Where(t => t.Type == "Income").Sum(t => t.Amount),
                    totalExpense = g.Where(t => t.Type == "Expense").Sum(t => t.Amount),
                    balance = g.Where(t => t.Type == "Income").Sum(t => t.Amount) - 
                             g.Where(t => t.Type == "Expense").Sum(t => t.Amount),
                    transactionCount = g.Count(),
                    incomeCount = g.Count(t => t.Type == "Income"),
                    expenseCount = g.Count(t => t.Type == "Expense")
                })
                .OrderBy(m => m.year)
                .ThenBy(m => m.month)
                .ToList();

            return Ok(monthlyData);
        }

        // GET: api/transactions/reports/comparison?year=2024&month=12
        [HttpGet("reports/comparison")]
        public async Task<ActionResult> GetMonthComparison(
            [FromQuery] int? year = null,
            [FromQuery] int? month = null)
        {
            var targetDate = year.HasValue && month.HasValue 
                ? new DateTime(year.Value, month.Value, 1)
                : new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

            var currentMonthStart = targetDate;
            var currentMonthEnd = currentMonthStart.AddMonths(1).AddDays(-1);

            var previousMonthStart = currentMonthStart.AddMonths(-1);
            var previousMonthEnd = previousMonthStart.AddMonths(1).AddDays(-1);

            var lastYearMonthStart = currentMonthStart.AddYears(-1);
            var lastYearMonthEnd = lastYearMonthStart.AddMonths(1).AddDays(-1);

            var allTransactions = await _context.Transactions
                .Where(t => t.Date >= lastYearMonthStart && t.Date <= currentMonthEnd)
                .ToListAsync();

            var currentMonth = allTransactions
                .Where(t => t.Date >= currentMonthStart && t.Date <= currentMonthEnd)
                .ToList();

            var currentIncome = currentMonth.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var currentExpense = currentMonth.Where(t => t.Type == "Expense").Sum(t => t.Amount);

            var previousMonth = allTransactions
                .Where(t => t.Date >= previousMonthStart && t.Date <= previousMonthEnd)
                .ToList();

            var previousIncome = previousMonth.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var previousExpense = previousMonth.Where(t => t.Type == "Expense").Sum(t => t.Amount);

            var lastYearMonth = allTransactions
                .Where(t => t.Date >= lastYearMonthStart && t.Date <= lastYearMonthEnd)
                .ToList();

            var lastYearIncome = lastYearMonth.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var lastYearExpense = lastYearMonth.Where(t => t.Type == "Expense").Sum(t => t.Amount);

            var incomeGrowthVsPrevious = previousIncome > 0 
                ? ((currentIncome - previousIncome) / previousIncome) * 100 
                : 0;

            var expenseGrowthVsPrevious = previousExpense > 0 
                ? ((currentExpense - previousExpense) / previousExpense) * 100 
                : 0;

            var incomeGrowthVsLastYear = lastYearIncome > 0 
                ? ((currentIncome - lastYearIncome) / lastYearIncome) * 100 
                : 0;

            var expenseGrowthVsLastYear = lastYearExpense > 0 
                ? ((currentExpense - lastYearExpense) / lastYearExpense) * 100 
                : 0;

            var comparison = new
            {
                currentMonth = new
                {
                    period = $"{currentMonthStart:MMM yyyy}",
                    income = currentIncome,
                    expense = currentExpense,
                    balance = currentIncome - currentExpense,
                    transactionCount = currentMonth.Count
                },
                previousMonth = new
                {
                    period = $"{previousMonthStart:MMM yyyy}",
                    income = previousIncome,
                    expense = previousExpense,
                    balance = previousIncome - previousExpense,
                    transactionCount = previousMonth.Count
                },
                lastYearMonth = new
                {
                    period = $"{lastYearMonthStart:MMM yyyy}",
                    income = lastYearIncome,
                    expense = lastYearExpense,
                    balance = lastYearIncome - lastYearExpense,
                    transactionCount = lastYearMonth.Count
                },
                growth = new
                {
                    incomeVsPrevious = Math.Round(incomeGrowthVsPrevious, 2),
                    expenseVsPrevious = Math.Round(expenseGrowthVsPrevious, 2),
                    incomeVsLastYear = Math.Round(incomeGrowthVsLastYear, 2),
                    expenseVsLastYear = Math.Round(expenseGrowthVsLastYear, 2)
                }
            };

            return Ok(comparison);
        }

        // GET: api/transactions/reports/top-categories?year=2024&month=12&limit=5
        [HttpGet("reports/top-categories")]
        public async Task<ActionResult> GetTopCategories(
            [FromQuery] int? year = null,
            [FromQuery] int? month = null,
            [FromQuery] int limit = 5)
        {
            var targetDate = year.HasValue && month.HasValue 
                ? new DateTime(year.Value, month.Value, 1)
                : new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

            var monthStart = targetDate;
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            var transactions = await _context.Transactions
                .Where(t => t.Date >= monthStart && t.Date <= monthEnd)
                .ToListAsync();

            var topExpenses = transactions
                .Where(t => t.Type == "Expense")
                .GroupBy(t => t.Category)
                .Select(g => new
                {
                    category = g.Key,
                    total = g.Sum(t => t.Amount),
                    count = g.Count(),
                    percentage = transactions.Where(t => t.Type == "Expense").Sum(t => t.Amount) > 0
                        ? (g.Sum(t => t.Amount) / transactions.Where(t => t.Type == "Expense").Sum(t => t.Amount)) * 100
                        : 0
                })
                .OrderByDescending(c => c.total)
                .Take(limit)
                .ToList();

            var topIncome = transactions
                .Where(t => t.Type == "Income")
                .GroupBy(t => t.Category)
                .Select(g => new
                {
                    category = g.Key,
                    total = g.Sum(t => t.Amount),
                    count = g.Count(),
                    percentage = transactions.Where(t => t.Type == "Income").Sum(t => t.Amount) > 0
                        ? (g.Sum(t => t.Amount) / transactions.Where(t => t.Type == "Income").Sum(t => t.Amount)) * 100
                        : 0
                })
                .OrderByDescending(c => c.total)
                .Take(limit)
                .ToList();

            return Ok(new
            {
                period = $"{monthStart:MMM yyyy}",
                topExpenses,
                topIncome
            });
        }

        // GET: api/transactions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        // POST: api/transactions
        [HttpPost]
        public async Task<ActionResult<Transaction>> CreateTransaction(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }

        // PUT: api/transactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, Transaction transaction)
        {
            if (id != transaction.Id)
            {
                return BadRequest();
            }

            _context.Entry(transaction).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null)
            {
                return NotFound();
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TransactionExists(int id)
        {
            return _context.Transactions.Any(e => e.Id == id);
        }
    }
}