using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FinanceTracker.API.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Description is required")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Description must be between 3 and 200 characters")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Date is required")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "Type is required")]
        [RegularExpression("^(Income|Expense)$", ErrorMessage = "Type must be either 'Income' or 'Expense'")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Category must be between 2 and 50 characters")]
        public string Category { get; set; } = string.Empty;

        public int UserId { get; set; }

        [JsonIgnore]
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}